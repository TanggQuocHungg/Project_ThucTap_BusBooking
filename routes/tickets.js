var express = require("express");
var router = express.Router();
let ticketController = require('../controllers/ticketController');
let validator = require('../utils/validator');
let authHandler = require('../utils/authHandler');
let responseHandler = require('../utils/responseHandler');

// GET tickets của user hoặc tất cả (nếu admin)
router.get("/", 
    authHandler.CheckLogin,
    async function (req, res, next) {
        try {
            let userId = req.query.userId;
            
            // User thường chỉ xem được vé của mình
            if (req.user.role.name !== 'admin' && userId && userId !== req.user._id.toString()) {
                responseHandler.forbidden(res, 'Bạn chỉ được xem vé của mình');
                return;
            }

            // Nếu user thường, mặc định xem vé của chính mình
            if (req.user.role.name !== 'admin') {
                userId = req.user._id;
            }

            let result = await ticketController.GetAllTickets(userId);
            responseHandler.success(res, 200, result, 'Lấy danh sách vé thành công');
        } catch (err) {
            responseHandler.error(res, 400, err.message);
        }
    }
);

// GET ticket theo id
router.get("/:id", 
    authHandler.CheckLogin,
    async function (req, res, next) {
        try {
            let result = await ticketController.GetATicketById(req.params.id);
            if (result) {
                // Kiểm tra quyền: chỉ admin hoặc chủ vé mới được xem
                if (req.user.role.name !== 'admin' && result.user._id.toString() !== req.user._id.toString()) {
                    responseHandler.forbidden(res, 'Bạn không có quyền xem vé này');
                    return;
                }
                responseHandler.success(res, 200, result, 'Lấy thông tin vé thành công');
            } else {
                responseHandler.notFound(res, 'Vé không tồn tại');
            }
        } catch (err) {
            responseHandler.error(res, 400, err.message);
        }
    }
);

// BOOK ticket (tạo đặt vé)
router.post("/", 
    authHandler.CheckLogin,
    authHandler.CheckRole('customer'),
    validator.BookTicketValidator,
    validator.validatedResult,
    async function (req, res, next) {
        try {
            let newItem = await ticketController.BookTicket(
                req.user._id,  // Dùng user từ token
                req.body.trip,
                req.body.seats,
                req.body.totalAmount
            );
            responseHandler.success(res, 201, newItem, 'Đặt vé thành công');
        } catch (err) {
            console.error('------- BOOK TICKET ERROR -------', err);
            responseHandler.error(res, 400, err.message);
        }
    }
);

// UPDATE ticket (cập nhật status)
router.put("/:id", 
    authHandler.CheckLogin,
    authHandler.CheckRole('admin'),
    validator.UpdateTicketValidator,
    validator.validatedResult,
    async function (req, res, next) {
        try {
            let updatedItem = await ticketController.UpdateATicket(req.params.id, req.body);
            if (updatedItem) {
                responseHandler.success(res, 200, updatedItem, 'Cập nhật vé thành công');
            } else {
                responseHandler.notFound(res, 'Vé không tồn tại');
            }
        } catch (err) {
            responseHandler.error(res, 400, err.message);
        }
    }
);

// CANCEL ticket (hủy vé)
router.post("/:id/cancel", 
    authHandler.CheckLogin,
    async function (req, res, next) {
        try {
            let ticket = await ticketController.GetATicketById(req.params.id);
            if (!ticket) {
                responseHandler.notFound(res, 'Vé không tồn tại');
                return;
            }

            // Kiểm tra quyền: chỉ admin hoặc chủ vé mới được hủy
            if (req.user.role.name !== 'admin' && ticket.user._id.toString() !== req.user._id.toString()) {
                responseHandler.forbidden(res, 'Bạn không có quyền hủy vé này');
                return;
            }

            let cancelledItem = await ticketController.CancelTicket(req.params.id);
            responseHandler.success(res, 200, cancelledItem, 'Hủy vé thành công');
        } catch (err) {
            responseHandler.error(res, 400, err.message);
        }
    }
);

// DELETE ticket (xóa vé - chỉ admin)
router.delete("/:id", 
    authHandler.CheckLogin,
    authHandler.CheckRole('admin'),
    validator.DeleteTicketValidator,
    validator.validatedResult,
    async function (req, res, next) {
        try {
            let updatedItem = await ticketController.DeleteATicket(req.params.id);
            if (updatedItem) {
                responseHandler.success(res, 200, updatedItem, 'Xóa vé thành công');
            } else {
                responseHandler.notFound(res, 'Vé không tồn tại');
            }
        } catch (err) {
            responseHandler.error(res, 400, err.message);
        }
    }
);

module.exports = router;