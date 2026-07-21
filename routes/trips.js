var express = require("express");
var router = express.Router();
let tripController = require('../controllers/tripController');
let validator = require('../utils/validator');
let authHandler = require('../utils/authHandler');
let responseHandler = require('../utils/responseHandler');

// GET tất cả trips
router.get("/", async function (req, res, next) {
    try {
        let result = await tripController.GetAllTrips();
        responseHandler.success(res, 200, result, 'Lấy danh sách chuyến thành công');
    } catch (err) {
        responseHandler.error(res, 400, err.message);
    }
});

// GET trip theo id
router.get("/:id", async function (req, res, next) {
    try {
        let result = await tripController.GetATripById(req.params.id);
        if (result) {
            responseHandler.success(res, 200, result, 'Lấy thông tin chuyến thành công');
        } else {
            responseHandler.notFound(res, 'Chuyến xe không tồn tại');
        }
    } catch (err) {
        responseHandler.error(res, 400, err.message);
    }
});

// CREATE trip (chỉ admin)
router.post("/", 
    authHandler.CheckLogin,
    authHandler.CheckRole('admin'),
    validator.CreateTripValidator,
    validator.validatedResult,
    async function (req, res, next) {
        try {
            let newItem = await tripController.CreateATrip(
                req.body.route,
                req.body.bus,
                req.body.departureTime,
                req.body.arrivalTime,
                req.body.price
            );
            responseHandler.success(res, 201, newItem, 'Tạo chuyến thành công');
        } catch (err) {
            responseHandler.error(res, 400, err.message);
        }
    }
);

// UPDATE trip (chỉ admin)
router.put("/:id", 
    authHandler.CheckLogin,
    authHandler.CheckRole('admin'),
    validator.UpdateTripValidator,
    validator.validatedResult,
    async function (req, res, next) {
        try {
            let updatedItem = await tripController.UpdateATrip(req.params.id, req.body);
            if (updatedItem) {
                responseHandler.success(res, 200, updatedItem, 'Cập nhật chuyến thành công');
            } else {
                responseHandler.notFound(res, 'Chuyến xe không tồn tại');
            }
        } catch (err) {
            responseHandler.error(res, 400, err.message);
        }
    }
);

// DELETE trip (chỉ admin)
router.delete("/:id", 
    authHandler.CheckLogin,
    authHandler.CheckRole('admin'),
    validator.DeleteTripValidator,
    validator.validatedResult,
    async function (req, res, next) {
        try {
            let updatedItem = await tripController.DeleteATrip(req.params.id);
            if (updatedItem) {
                responseHandler.success(res, 200, updatedItem, 'Xóa chuyến thành công');
            } else {
                responseHandler.notFound(res, 'Chuyến xe không tồn tại');
            }
        } catch (err) {
            responseHandler.error(res, 400, err.message);
        }
    }
);

module.exports = router;