var express = require("express");
var router = express.Router();
let busController = require('../controllers/busController');
let validator = require('../utils/validator');
let authHandler = require('../utils/authHandler');
let responseHandler = require('../utils/responseHandler');
let uploadHandler = require('../utils/uploadHandler');

// GET tất cả buses
router.get("/", async function (req, res, next) {
    try {
        let result = await busController.GetAllBuses();
        responseHandler.success(res, 200, result, 'Lấy danh sách xe thành công');
    } catch (err) {
        responseHandler.error(res, 400, err.message);
    }
});

// GET bus theo id
router.get("/:id", async function (req, res, next) {
    try {
        let result = await busController.GetABusById(req.params.id);
        if (result) {
            responseHandler.success(res, 200, result, 'Lấy thông tin xe thành công');
        } else {
            responseHandler.notFound(res, 'Xe không tồn tại');
        }
    } catch (err) {
        responseHandler.error(res, 400, err.message);
    }
});

// CREATE bus (chỉ admin)
router.post("/", 
    authHandler.CheckLogin,
    authHandler.CheckRole('admin'),
    uploadHandler.uploadImage.single('image'),
    validator.CreateBusValidator,
    validator.validatedResult,
    async function (req, res, next) {
        try {
            let newItem = await busController.CreateABus(
                req.body.licensePlate,
                req.body.type,
                req.body.capacity,
                imageUrl
            );
            responseHandler.success(res, 201, newItem, 'Tạo xe thành công');
        } catch (err) {
            responseHandler.error(res, 400, err.message);
        }
    }
);

// UPDATE bus (chỉ admin)
router.put("/:id", 
    authHandler.CheckLogin,
    authHandler.CheckRole('admin'),
    uploadHandler.uploadImage.single('image'), 
    validator.UpdateBusValidator,
    validator.validatedResult,
    async function (req, res, next) {
        try {
            let updateData = {
                licensePlate: req.body.licensePlate,
                type: req.body.type,
                capacity: req.body.capacity
            };
            if (req.file) {
                updateData.imageUrl = '/uploads/' + req.file.filename;
            }

            let updatedItem = await busController.UpdateABus(req.params.id, updateData);
            if (updatedItem) {
                responseHandler.success(res, 200, updatedItem, 'Cập nhật xe thành công');
            } else {
                responseHandler.notFound(res, 'Xe không tồn tại');
            }
        } catch (err) {
            responseHandler.error(res, 400, err.message);
        }
    }
);

// DELETE bus (chỉ admin)
router.delete("/:id", 
    authHandler.CheckLogin,
    authHandler.CheckRole('admin'),
    validator.DeleteBusValidator,
    validator.validatedResult,
    async function (req, res, next) {
        try {
            let updatedItem = await busController.DeleteABus(req.params.id);
            if (updatedItem) {
                responseHandler.success(res, 200, updatedItem, 'Xóa xe thành công');
            } else {
                responseHandler.notFound(res, 'Xe không tồn tại');
            }
        } catch (err) {
            responseHandler.error(res, 400, err.message);
        }
    }
);

module.exports = router;