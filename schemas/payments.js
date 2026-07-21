let mongoose = require('mongoose');

let paymentSchema = mongoose.Schema({
    ticket: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ticket',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    method: {
        type: String,
        required: true // VNPAY, MOMO, CASH
    },
    status: {
        type: String,
        default: "PENDING" // PENDING, SUCCESS, FAILED
    },
    transactionNo: {
        type: String, 
        default: "" // Mã giao dịch ghi nhận trên hệ thống VNPay
    },
    bankCode: {
        type: String,
        default: "" // Ngân hàng khách dùng thanh toán (VD: NCB, VCB, VISA...)
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('payment', paymentSchema);