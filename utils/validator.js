let { body, validationResult, param } = require('express-validator');

module.exports = {
    // Middleware xử lý lỗi từ các validator bên dưới
    validatedResult: function (req, res, next) {
        let result = validationResult(req);
        if (!result.isEmpty()) {
            console.error('------- VALIDATION ERROR -------', result.errors);
            res.status(400).json({
                success: false,
                message: 'Validation Error',
                errors: result.errors.map(function (e) {
                    return { field: e.path, message: e.msg };
                })
            });
            return;
        }
        next();
    },

    // ============ AUTH VALIDATORS ============
    RegisterValidator: [
        body('email').notEmpty().withMessage("email khong duoc de trong")
            .bail().isEmail().withMessage("email sai dinh dang"),
        
        body('username').notEmpty().withMessage("username khong duoc de trong")
            .bail().isLength({ min: 3 }).withMessage("username toi thieu 3 ky tu")
            .bail().isAlphanumeric().withMessage("username chi chua chu va so"),
        
        body('password').notEmpty().withMessage("password khong duoc de trong")
            .bail().isLength({ min: 8 }).withMessage("password toi thieu 8 ky tu"),
        
        body('fullName').notEmpty().withMessage("fullName khong duoc de trong"),
        
        body('role').optional()
            .bail().isIn(['customer', 'admin', 'driver']).withMessage("role phai la customer, admin hoac driver")
    ],

    LoginValidator: [
        body('username').notEmpty().withMessage("username khong duoc de trong"),
        body('password').notEmpty().withMessage("password khong duoc de trong")
    ],

    // ============ BUS VALIDATORS ============
    CreateBusValidator: [
        body('licensePlate').notEmpty().withMessage("licensePlate khong duoc de trong")
            .bail().trim(),
        body('type').notEmpty().withMessage("type khong duoc de trong")
            .bail().isIn(['BUS_29', 'BUS_45', 'BUS_60']).withMessage("type phai la BUS_29, BUS_45 hoac BUS_60"),
        body('capacity').notEmpty().withMessage("capacity khong duoc de trong")
            .bail().isInt({ min: 1 }).withMessage("capacity phai la so duong")
    ],

    UpdateBusValidator: [
        param('id').isMongoId().withMessage("id khong hop le"),
        body('licensePlate').optional().trim(),
        body('type').optional().isIn(['BUS_29', 'BUS_45', 'BUS_60']).withMessage("type khong hop le"),
        body('capacity').optional().isInt({ min: 1 }).withMessage("capacity phai la so duong")
    ],

    DeleteBusValidator: [
        param('id').isMongoId().withMessage("id khong hop le")
    ],

    // ============ TRIP VALIDATORS ============
    CreateTripValidator: [
        body('route').notEmpty().withMessage("route khong duoc de trong")
            .bail().isMongoId().withMessage("route id khong hop le"),
        body('bus').notEmpty().withMessage("bus khong duoc de trong")
            .bail().isMongoId().withMessage("bus id khong hop le"),
        body('departureTime').notEmpty().withMessage("departureTime khong duoc de trong"),
        body('arrivalTime').notEmpty().withMessage("arrivalTime khong duoc de trong"),
        body('price').notEmpty().withMessage("price khong duoc de trong")
            .bail().isFloat({ min: 0 }).withMessage("price phai la so duong")
    ],

    UpdateTripValidator: [
        param('id').isMongoId().withMessage("id khong hop le"),
        body('price').optional().isFloat({ min: 0 }).withMessage("price phai la so duong"),
        body('status').optional().isIn(['PENDING', 'RUNNING', 'COMPLETED', 'CANCELLED']).withMessage("status khong hop le")
    ],

    DeleteTripValidator: [
        param('id').isMongoId().withMessage("id khong hop le")
    ],

    // ============ TICKET VALIDATORS ============
    BookTicketValidator: [
        body('trip').notEmpty().withMessage("trip khong duoc de trong")
            .bail().isMongoId().withMessage("trip id khong hop le"),
        body('seats').notEmpty().withMessage("seats khong duoc de trong")
            .bail().isArray({ min: 1 }).withMessage("seats phai la mang va co it nhat 1 ghe"),
        body('totalAmount').notEmpty().withMessage("totalAmount khong duoc de trong")
            .bail().isFloat({ min: 0.01 }).withMessage("totalAmount phai lon hon 0")
    ],

    UpdateTicketValidator: [
        param('id').isMongoId().withMessage("id khong hop le"),
        body('status').optional().isIn(['PENDING', 'CONFIRMED', 'CANCELLED']).withMessage("status khong hop le")
    ],

    DeleteTicketValidator: [
        param('id').isMongoId().withMessage("id khong hop le")
    ],

    // ============ PAYMENT VALIDATORS ============
    CreatePaymentValidator: [
        body('ticket').notEmpty().withMessage("ticket khong duoc de trong")
            .bail().isMongoId().withMessage("ticket id khong hop le"),
        body('amount').notEmpty().withMessage("amount khong duoc de trong")
            .bail().isFloat({ min: 0.01 }).withMessage("amount phai lon hon 0"),
        body('method').notEmpty().withMessage("method khong duoc de trong")
            .bail().isIn(['VNPAY', 'MOMO', 'CASH']).withMessage("method phai la VNPAY, MOMO hoac CASH")
    ],

    UpdatePaymentValidator: [
        param('id').isMongoId().withMessage("id khong hop le"),
        body('status').optional().isIn(['PENDING', 'SUCCESS', 'FAILED']).withMessage("status khong hop le")
    ],

    DeletePaymentValidator: [
        param('id').isMongoId().withMessage("id khong hop le")
    ],

    // ============ SEAT VALIDATORS ============
    CreateSeatValidator: [
        body('trip').notEmpty().withMessage("trip khong duoc de trong")
            .bail().isMongoId().withMessage("trip id khong hop le"),
        body('seatNumber').notEmpty().withMessage("seatNumber khong duoc de trong")
    ],

    UpdateSeatValidator: [
        param('id').isMongoId().withMessage("id khong hop le"),
        body('status').optional().isIn(['AVAILABLE', 'HOLD', 'BOOKED']).withMessage("status khong hop le")
    ],

    DeleteSeatValidator: [
        param('id').isMongoId().withMessage("id khong hop le")
    ],

    // ============ STATION VALIDATORS ============
    CreateStationValidator: [
        body('name').notEmpty().withMessage("name khong duoc de trong"),
        body('address').notEmpty().withMessage("address khong duoc de trong"),
        body('city').notEmpty().withMessage("city khong duoc de trong")
    ],

    UpdateStationValidator: [
        param('id').isMongoId().withMessage("id khong hop le"),
        body('name').optional().trim(),
        body('address').optional().trim(),
        body('city').optional().trim()
    ],

    DeleteStationValidator: [
        param('id').isMongoId().withMessage("id khong hop le")
    ],

    // ============ ROUTE VALIDATORS ============
    CreateRouteValidator: [
        body('startStation').notEmpty().withMessage("startStation khong duoc de trong")
            .bail().isMongoId().withMessage("startStation id khong hop le"),
        body('endStation').notEmpty().withMessage("endStation khong duoc de trong")
            .bail().isMongoId().withMessage("endStation id khong hop le"),
        body('distance').notEmpty().withMessage("distance khong duoc de trong")
            .bail().isFloat({ min: 0.1 }).withMessage("distance phai lon hon 0"),
        body('basePrice').notEmpty().withMessage("basePrice khong duoc de trong")
            .bail().isFloat({ min: 0 }).withMessage("basePrice phai la so duong")
    ],

    UpdateRouteValidator: [
        param('id').isMongoId().withMessage("id khong hop le"),
        body('distance').optional().isFloat({ min: 0.1 }).withMessage("distance phai lon hon 0"),
        body('basePrice').optional().isFloat({ min: 0 }).withMessage("basePrice phai la so duong")
    ],

    DeleteRouteValidator: [
        param('id').isMongoId().withMessage("id khong hop le")
    ],

    // ============ REVIEW VALIDATORS ============
    CreateReviewValidator: [
        body('trip').notEmpty().withMessage("trip khong duoc de trong")
            .bail().isMongoId().withMessage("trip id khong hop le"),
        body('rating').notEmpty().withMessage("rating khong duoc de trong")
            .bail().isInt({ min: 1, max: 5 }).withMessage("rating phai tu 1 den 5"),
        body('comment').optional().trim()
    ],

    UpdateReviewValidator: [
        param('id').isMongoId().withMessage("id khong hop le"),
        body('rating').optional().isInt({ min: 1, max: 5 }).withMessage("rating phai tu 1 den 5")
    ],

    DeleteReviewValidator: [
        param('id').isMongoId().withMessage("id khong hop le")
    ],

    // ============ USER VALIDATORS ============
    CreateUserValidator: [
        body('email').notEmpty().withMessage("email khong duoc de trong")
            .bail().isEmail().withMessage("email sai dinh dang"),
        body('username').notEmpty().withMessage("username khong duoc de trong")
            .bail().isLength({ min: 3 }).withMessage("username toi thieu 3 ky tu"),
        body('password').notEmpty().withMessage("password khong duoc de trong")
            .bail().isLength({ min: 8 }).withMessage("password toi thieu 8 ky tu"),
        body('fullName').notEmpty().withMessage("fullName khong duoc de trong"),
        body('role').notEmpty().withMessage("role khong duoc de trong")
            .bail().isIn(['customer', 'admin', 'driver']).withMessage("role khong hop le")
    ],

    UpdateUserValidator: [
        param('id').isMongoId().withMessage("id khong hop le")
    ],

    DeleteUserValidator: [
        param('id').isMongoId().withMessage("id khong hop le")
    ]
}