var express = require("express");
var router = express.Router();
let authController = require('../controllers/authController');
let validator = require('../utils/validator');
let responseHandler = require('../utils/responseHandler');

// BƯỚC 1: Import file validator vào
// (Đã import ở trên)

// BƯỚC 2: Gắn các middleware kiểm tra dữ liệu vào trước khi chạy hàm Register
router.post('/register', validator.RegisterValidator, validator.validatedResult, async function (req, res, next) {
    try {
        let role = req.body.role || 'customer';
        let newItem = await authController.Register(
            req.body.username,
            req.body.email,
            req.body.password,
            role,
            req.body.fullName
        );
        responseHandler.success(res, 201, newItem, 'Đăng ký thành công');
    } catch (err) {
        responseHandler.error(res, 400, err.message);
    }
});

// Tương tự, gắn middleware kiểm tra cho Login
router.post('/login', validator.LoginValidator, validator.validatedResult, async function (req, res, next) {
    try {
        let result = await authController.Login(
            req.body.username,
            req.body.password
        );
        responseHandler.success(res, 200, result, 'Đăng nhập thành công');
    } catch (err) {
        responseHandler.error(res, 400, err.message);
    }
});

module.exports = router;