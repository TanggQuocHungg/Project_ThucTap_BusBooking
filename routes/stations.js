var express = require("express");
var router = express.Router();
let stationController = require('../controllers/stationController');
let validator = require('../utils/validator');
let authHandler = require('../utils/authHandler');
let responseHandler = require('../utils/responseHandler');

// GET tất cả stations
router.get("/", async function (req, res, next) {
    try {
        let result = await stationController.GetAllStations();
        responseHandler.success(res, 200, result, 'Lấy danh sách bến xe thành công');
    } catch (err) {
        responseHandler.error(res, 400, err.message);
    }
});

// GET station theo id
router.get("/:id", async function (req, res, next) {
    try {
        let result = await stationController.GetAStationById(req.params.id);
        if (result) {
            responseHandler.success(res, 200, result, 'Lấy thông tin bến xe thành công');
        } else {
            responseHandler.notFound(res, 'Bến xe không tồn tại');
        }
    } catch (err) {
        responseHandler.error(res, 400, err.message);
    }
});

// CREATE station (chỉ admin)
router.post("/", 
    authHandler.CheckLogin,
    authHandler.CheckRole('admin'),
    validator.CreateStationValidator,
    validator.validatedResult,
    async function (req, res, next) {
        try {
            let newItem = await stationController.CreateAStation(
                req.body.name,
                req.body.address,
                req.body.city
            );
            responseHandler.success(res, 201, newItem, 'Tạo bến xe thành công');
        } catch (err) {
            responseHandler.error(res, 400, err.message);
        }
    }
);

// UPDATE station (chỉ admin)
router.put("/:id", 
    authHandler.CheckLogin,
    authHandler.CheckRole('admin'),
    validator.UpdateStationValidator,
    validator.validatedResult,
    async function (req, res, next) {
        try {
            let updatedItem = await stationController.UpdateAStation(req.params.id, req.body);
            if (updatedItem) {
                responseHandler.success(res, 200, updatedItem, 'Cập nhật bến xe thành công');
            } else {
                responseHandler.notFound(res, 'Bến xe không tồn tại');
            }
        } catch (err) {
            responseHandler.error(res, 400, err.message);
        }
    }
);

// DELETE station (chỉ admin)
router.delete("/:id", 
    authHandler.CheckLogin,
    authHandler.CheckRole('admin'),
    validator.DeleteStationValidator,
    validator.validatedResult,
    async function (req, res, next) {
        try {
            let updatedItem = await stationController.DeleteAStation(req.params.id);
            if (updatedItem) {
                responseHandler.success(res, 200, updatedItem, 'Xóa bến xe thành công');
            } else {
                responseHandler.notFound(res, 'Bến xe không tồn tại');
            }
        } catch (err) {
            responseHandler.error(res, 400, err.message);
        }
    }
);

module.exports = router;