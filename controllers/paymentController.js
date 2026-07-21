let paymentModel = require('../schemas/payments')
let ticketModel = require('../schemas/tickets')
let mongoose = require('mongoose')

module.exports = {
    CreateAPayment: async function (ticket, amount, method) {
        try {
            let ticketData = await ticketModel.findOne({ 
                _id: ticket, 
                isDeleted: false 
            });
            if (!ticketData) {
                throw new Error("Vé không tồn tại");
            }
            if (ticketData.status === 'CONFIRMED') {
                throw new Error("Vé này đã được thanh toán rồi");
            }
            if (amount !== ticketData.totalAmount) {
                throw new Error("Số tiền không khớp với tổng tiền vé");
            }

            let newItem = new paymentModel({
                ticket: ticket,
                amount: amount,
                method: method,
                status: "PENDING"
            });
            await newItem.save();
            return newItem;
        } catch (error) {
            throw error;
        }
    },

    GetAllPayments: async function () {
        return await paymentModel.find({
            isDeleted: false
        }).populate('ticket')
    },

    GetAPaymentById: async function (id) {
        let result = await paymentModel.findOne({
            isDeleted: false,
            _id: id
        }).populate('ticket')
        if (result) {
            return result;
        }
        return false;
    },

    UpdateAPayment: async function (id, updateData) {
        try {
            // Cho phép update status, transactionNo, bankCode
            let allowedFields = ['status', 'transactionNo', 'bankCode']; 
            let cleanData = {};
            
            for (let field of allowedFields) {
                if (updateData[field] !== undefined) {
                    cleanData[field] = updateData[field];
                }
            }

            let payment = await paymentModel.findOne({
                _id: id,
                isDeleted: false
            });

            if (!payment) {
                return false;
            }

            if (cleanData.status === 'SUCCESS' && payment.status !== 'SUCCESS') {
                await ticketModel.findByIdAndUpdate(
                    payment.ticket,
                    { status: 'CONFIRMED' }
                );
            }

            let updatedItem = await paymentModel.findByIdAndUpdate(
                id,
                cleanData,
                { new: true }
            ).populate('ticket');

            if (updatedItem) {
                return updatedItem;
            }
            return false;
        } catch (error) {
            throw error;
        }
    },

    DeleteAPayment: async function (id) {
        let updatedItem = await paymentModel.findOneAndUpdate({
            isDeleted: false,
            _id: id
        }, {
            isDeleted: true
        }, { new: true })

        if (updatedItem) {
            return updatedItem;
        }
        return false;
    }
}