var express = require("express");
var router = express.Router();
let routeController = require('../controllers/routeController');
let validator = require('../utils/validator');
let authHandler = require('../utils/authHandler');
let responseHandler = require('../utils/responseHandler');

// GET tất cả routes
router.get("/", async function (req, res, next) {
    try {
        let result = await routeController.GetAllRoutes();
        responseHandler.success(res, 200, result, 'Lấy danh sách tuyến đường thành công');
    } catch (err) {
        responseHandler.error(res, 400, err.message);
    }
});

// GET route theo id
router.get("/:id", async function (req, res, next) {
    try {
        let result = await routeController.GetARouteById(req.params.id);
        if (result) {
            responseHandler.success(res, 200, result, 'Lấy thông tin tuyến đường thành công');
        } else {
            responseHandler.notFound(res, 'Tuyến đường không tồn tại');
        }
    } catch (err) {
        responseHandler.error(res, 400, err.message);
    }
});

// CREATE route (chỉ admin)
router.post("/", 
    authHandler.CheckLogin,
    authHandler.CheckRole('admin'),
    validator.CreateRouteValidator,
    validator.validatedResult,
    async function (req, res, next) {
        try {
            let newItem = await routeController.CreateARoute(
                req.body.startStation,
                req.body.endStation,
                req.body.distance,
                req.body.basePrice
            );
            responseHandler.success(res, 201, newItem, 'Tạo tuyến đường thành công');
        } catch (err) {
            responseHandler.error(res, 400, err.message);
        }
    }
);

// UPDATE route (chỉ admin)
router.put("/:id", 
    authHandler.CheckLogin,
    authHandler.CheckRole('admin'),
    validator.UpdateRouteValidator,
    validator.validatedResult,
    async function (req, res, next) {
        try {
            let updatedItem = await routeController.UpdateARoute(req.params.id, req.body);
            if (updatedItem) {
                responseHandler.success(res, 200, updatedItem, 'Cập nhật tuyến đường thành công');
            } else {
                responseHandler.notFound(res, 'Tuyến đường không tồn tại');
            }
        } catch (err) {
            responseHandler.error(res, 400, err.message);
        }
    }
);

// DELETE route (chỉ admin)
router.delete("/:id", 
    authHandler.CheckLogin,
    authHandler.CheckRole('admin'),
    validator.DeleteRouteValidator,
    validator.validatedResult,
    async function (req, res, next) {
        try {
            let updatedItem = await routeController.DeleteARoute(req.params.id);
            if (updatedItem) {
                responseHandler.success(res, 200, updatedItem, 'Xóa tuyến đường thành công');
            } else {
                responseHandler.notFound(res, 'Tuyến đường không tồn tại');
            }
        } catch (err) {
            responseHandler.error(res, 400, err.message);
        }
    }
);

module.exports = router;