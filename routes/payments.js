var express = require("express");
var router = express.Router();
let paymentController = require('../controllers/paymentController');
let validator = require('../utils/validator');
let authHandler = require('../utils/authHandler');
let responseHandler = require('../utils/responseHandler');

let moment = require('moment');
let crypto = require('crypto');
let querystring = require('qs');

function sortObject(obj) {
    let sorted = {};
    // Dùng Object.keys thay vì vòng lặp for...in để tránh lỗi Prototype của Express
    let keys = Object.keys(obj).sort();
    for (let i = 0; i < keys.length; i++) {
        sorted[keys[i]] = encodeURIComponent(obj[keys[i]]).replace(/%20/g, "+");
    }
    return sorted;
}

// ==========================================
// ĐƯA API VNPAY LÊN TRÊN CÙNG ĐỂ TRÁNH LỖI ĐỤNG ROUTE /:id
// ==========================================
router.post('/create_payment_url', authHandler.CheckLogin, async function (req, res, next) {
    try {
        let ipAddr = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || req.socket?.remoteAddress || '127.0.0.1';
        if (ipAddr === '::1') ipAddr = '127.0.0.1';

        let tmnCode = (process.env.VNP_TMN_CODE || '').trim();
        let secretKey = (process.env.VNP_HASH_SECRET || '').trim();
        let vnpUrl = (process.env.VNP_URL || '').trim();
        let returnUrl = (process.env.VNP_RETURN_URL || '').trim();

        let createDate = moment().utcOffset(7).format('YYYYMMDDHHmmss');
        let orderId = moment().utcOffset(7).format('DDHHmmss'); 

        let amount = req.body.amount;
        let bankCode = req.body.bankCode; 
        let ticketId = req.body.ticketId; 

        let newPayment = await paymentController.CreateAPayment(ticketId, amount, 'VNPAY');

        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = tmnCode;
        vnp_Params['vnp_Locale'] = 'vn';
        vnp_Params['vnp_CurrCode'] = 'VND';
        vnp_Params['vnp_TxnRef'] = orderId;
        vnp_Params['vnp_OrderInfo'] = 'Thanh_toan_ve_' + newPayment._id; 
        vnp_Params['vnp_OrderType'] = 'other';
        vnp_Params['vnp_Amount'] = Math.round(amount * 100); 
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = createDate;
        
        if (bankCode !== null && bankCode !== '' && bankCode !== undefined) {
            vnp_Params['vnp_BankCode'] = bankCode;
        }

        vnp_Params = sortObject(vnp_Params);
        let signData = querystring.stringify(vnp_Params, { encode: false });
        let hmac = crypto.createHmac("sha512", secretKey);
        let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex"); 
        vnp_Params['vnp_SecureHash'] = signed;
        
        vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

        responseHandler.success(res, 200, { url: vnpUrl }, 'Tạo link thanh toán VNPay thành công');
   } catch (error) {
        console.error("Lỗi catch vnpay_return:", error);
        // Gắn thẳng mã lỗi vào URL để Frontend đọc được
        res.redirect(`http://localhost:5173/my-tickets?payment=error&msg=${encodeURIComponent(error.message)}`);
    }
});

router.get('/vnpay_return', async function (req, res, next) {
    try {
        let vnp_Params = req.query;
        let secureHash = vnp_Params['vnp_SecureHash'];

        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        vnp_Params = sortObject(vnp_Params);
        
        let secretKey = (process.env.VNP_HASH_SECRET || '').trim();
        let signData = querystring.stringify(vnp_Params, { encode: false });
        let hmac = crypto.createHmac("sha512", secretKey);
        let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

        if (secureHash === signed) {
            let orderInfo = vnp_Params['vnp_OrderInfo'];
            let paymentId = orderInfo.split('Thanh_toan_ve_')[1]; 

            if (vnp_Params['vnp_ResponseCode'] === '00') {
                await paymentController.UpdateAPayment(paymentId, { 
                    status: 'SUCCESS',
                    transactionNo: vnp_Params['vnp_TransactionNo'], 
                    bankCode: vnp_Params['vnp_BankCode']            
                });
                res.redirect('http://localhost:5173/my-tickets?payment=success');
            } else {
                await paymentController.UpdateAPayment(paymentId, { status: 'FAILED' });
                res.redirect('http://localhost:5173/my-tickets?payment=failed');
            }
        } else {
            console.error("Lỗi sai chữ ký lúc return! Chuỗi tạo ra:", signed, "- Chuỗi VNPay gửi:", secureHash);
            res.redirect('http://localhost:5173/my-tickets?payment=checksum_failed');
        }
    } catch (error) {
        console.error("Lỗi catch vnpay_return:", error);
        res.redirect('http://localhost:5173/my-tickets?payment=error');
    }
});

// ==========================================
// CÁC API QUẢN LÝ PAYMENT NẰM Ở DƯỚI 
// ==========================================

// GET tất cả payments
router.get("/", authHandler.CheckLogin, authHandler.CheckRole('admin'), async function (req, res, next) {
    try {
        let result = await paymentController.GetAllPayments();
        responseHandler.success(res, 200, result, 'Lấy danh sách thanh toán thành công');
    } catch (err) {
        responseHandler.error(res, 400, err.message);
    }
});

// GET payment theo id (Thủ phạm gây lỗi nằm ở đây, giờ đã bị dời xuống dưới)
router.get("/:id", authHandler.CheckLogin, async function (req, res, next) {
    try {
        let result = await paymentController.GetAPaymentById(req.params.id);
        if (result) {
            if (req.user.role.name !== 'admin' && result.ticket.user.toString() !== req.user._id.toString()) {
                responseHandler.forbidden(res, 'Bạn không có quyền xem thanh toán này');
                return;
            }
            responseHandler.success(res, 200, result, 'Lấy thông tin thanh toán thành công');
        } else {
            responseHandler.notFound(res, 'Thanh toán không tồn tại');
        }
    } catch (err) {
        responseHandler.error(res, 400, err.message);
    }
});

// CREATE payment 
router.post("/", authHandler.CheckLogin, validator.CreatePaymentValidator, validator.validatedResult, async function (req, res, next) {
    try {
        let newItem = await paymentController.CreateAPayment(req.body.ticket, req.body.amount, req.body.method);
        responseHandler.success(res, 201, newItem, 'Tạo đơn thanh toán thành công');
    } catch (err) {
        responseHandler.error(res, 400, err.message);
    }
});

// UPDATE payment 
router.put("/:id", authHandler.CheckLogin, authHandler.CheckRole('admin', 'customer'), validator.UpdatePaymentValidator, validator.validatedResult, async function (req, res, next) {
    try {
        let updatedItem = await paymentController.UpdateAPayment(req.params.id, req.body);
        if (updatedItem) {
            responseHandler.success(res, 200, updatedItem, 'Cập nhật thanh toán thành công');
        } else {
            responseHandler.notFound(res, 'Thanh toán không tồn tại');
        }
    } catch (err) {
        responseHandler.error(res, 400, err.message);
    }
});

// DELETE payment 
router.delete("/:id", authHandler.CheckLogin, authHandler.CheckRole('admin'), validator.DeletePaymentValidator, validator.validatedResult, async function (req, res, next) {
    try {
        let updatedItem = await paymentController.DeleteAPayment(req.params.id);
        if (updatedItem) {
            responseHandler.success(res, 200, updatedItem, 'Xóa thanh toán thành công');
        } else {
            responseHandler.notFound(res, 'Thanh toán không tồn tại');
        }
    } catch (err) {
        responseHandler.error(res, 400, err.message);
    }
});

module.exports = router;