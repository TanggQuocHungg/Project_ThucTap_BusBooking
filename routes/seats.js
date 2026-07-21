var express = require("express");
var router = express.Router();
let seatController = require('../controllers/seatController');
let validator = require('../utils/validator');
let authHandler = require('../utils/authHandler');
let responseHandler = require('../utils/responseHandler');

// GET seats của trip
router.get("/", async function (req, res, next) {
    try {
        let tripId = req.query.tripId || req.query.trip;
        let result = await seatController.GetAllSeats(tripId);
        responseHandler.success(res, 200, result, 'Lấy danh sách ghế thành công');
    } catch (err) {
        responseHandler.error(res, 400, err.message);
    }
});

// GET seat theo id
router.get("/:id", async function (req, res, next) {
    try {
        let result = await seatController.GetASeatById(req.params.id);
        if (result) {
            responseHandler.success(res, 200, result, 'Lấy thông tin ghế thành công');
        } else {
            responseHandler.notFound(res, 'Ghế không tồn tại');
        }
    } catch (err) {
        responseHandler.error(res, 400, err.message);
    }
});

// CREATE seat (chỉ admin)
router.post("/", 
    authHandler.CheckLogin,
    authHandler.CheckRole('admin'),
    validator.CreateSeatValidator,
    validator.validatedResult,
    async function (req, res, next) {
        try {
            let newItem = await seatController.CreateASeat(
                req.body.trip,
                req.body.seatNumber,
                req.body.status
            );
            responseHandler.success(res, 201, newItem, 'Tạo ghế thành công');
        } catch (err) {
            responseHandler.error(res, 400, err.message);
        }
    }
);

// UPDATE seat (chỉ admin - thường để update status)
router.put("/:id", 
    authHandler.CheckLogin,
    authHandler.CheckRole('admin'),
    validator.UpdateSeatValidator,
    validator.validatedResult,
    async function (req, res, next) {
        try {
            let updatedItem = await seatController.UpdateASeat(req.params.id, req.body);
            if (updatedItem) {
                responseHandler.success(res, 200, updatedItem, 'Cập nhật ghế thành công');
            } else {
                responseHandler.notFound(res, 'Ghế không tồn tại');
            }
        } catch (err) {
            responseHandler.error(res, 400, err.message);
        }
    }
);

// DELETE seat (chỉ admin)
router.delete("/:id", 
    authHandler.CheckLogin,
    authHandler.CheckRole('admin'),
    validator.DeleteSeatValidator,
    validator.validatedResult,
    async function (req, res, next) {
        try {
            let updatedItem = await seatController.DeleteASeat(req.params.id);
            if (updatedItem) {
                responseHandler.success(res, 200, updatedItem, 'Xóa ghế thành công');
            } else {
                responseHandler.notFound(res, 'Ghế không tồn tại');
            }
        } catch (err) {
            responseHandler.error(res, 400, err.message);
        }
    }
);

module.exports = router;