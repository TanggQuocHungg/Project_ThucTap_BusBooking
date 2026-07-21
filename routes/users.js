var express = require("express");
var router = express.Router();
let userController = require('../controllers/userController');
let validator = require('../utils/validator');
let authHandler = require('../utils/authHandler');
let responseHandler = require('../utils/responseHandler');
let uploadHandler = require('../utils/uploadHandler');

// GET tất cả users (chỉ admin)
router.get("/", 
    authHandler.CheckLogin,
    authHandler.CheckRole('admin'),
    async function (req, res, next) {
        try {
            let result = await userController.GetAllUsers();
            responseHandler.success(res, 200, result, 'Lấy danh sách người dùng thành công');
        } catch (err) {
            responseHandler.error(res, 400, err.message);
        }
    }
);

// GET user theo id
router.get("/:id", 
    authHandler.CheckLogin,
    async function (req, res, next) {
        try {
            let result = await userController.GetAnUserById(req.params.id);
            if (result) {
                // Kiểm tra quyền: chỉ admin hoặc chính user đó mới được xem
                if (req.user.role.name !== 'admin' && result._id.toString() !== req.user._id.toString()) {
                    responseHandler.forbidden(res, 'Bạn không có quyền xem thông tin người dùng này');
                    return;
                }
                responseHandler.success(res, 200, result, 'Lấy thông tin người dùng thành công');
            } else {
                responseHandler.notFound(res, 'Người dùng không tồn tại');
            }
        } catch (err) {
            responseHandler.error(res, 400, err.message);
        }
    }
);

// CREATE user (chỉ admin)
router.post("/", 
    authHandler.CheckLogin,
    authHandler.CheckRole('admin'),
    validator.CreateUserValidator,
    validator.validatedResult,
    async function (req, res, next) {
        try {
            let newItem = await userController.CreateAnUser(
                req.body.username,
                req.body.email,
                req.body.password,
                req.body.role,
                req.body.fullName
            );
            responseHandler.success(res, 201, newItem, 'Tạo người dùng thành công');
        } catch (err) {
            responseHandler.error(res, 400, err.message);
        }
    }
);

// UPDATE user (chỉ admin hoặc chính user đó)
router.put("/:id", 
    authHandler.CheckLogin,
    validator.UpdateUserValidator,
    validator.validatedResult,
    async function (req, res, next) {
        try {
            let user = await userController.GetAnUserById(req.params.id);
            if (!user) {
                responseHandler.notFound(res, 'Người dùng không tồn tại');
                return;
            }

            // Kiểm tra quyền
            if (req.user.role.name !== 'admin' && user._id.toString() !== req.user._id.toString()) {
                responseHandler.forbidden(res, 'Bạn không có quyền sửa thông tin người dùng này');
                return;
            }

            // Không cho update role (chỉ admin có thể tạo user với role khác)
            let updateData = { ...req.body };
            delete updateData.role;

            let updatedItem = await userController.UpdateAnUser(req.params.id, updateData);
            if (updatedItem) {
                responseHandler.success(res, 200, updatedItem, 'Cập nhật người dùng thành công');
            } else {
                responseHandler.notFound(res, 'Người dùng không tồn tại');
            }
        } catch (err) {
            responseHandler.error(res, 400, err.message);
        }
    }
);

// DELETE user (chỉ admin)
router.delete("/:id", 
    authHandler.CheckLogin,
    authHandler.CheckRole('admin'),
    validator.DeleteUserValidator,
    validator.validatedResult,
    async function (req, res, next) {
        try {
            let updatedItem = await userController.DeleteAnUser(req.params.id);
            if (updatedItem) {
                responseHandler.success(res, 200, updatedItem, 'Xóa người dùng thành công');
            } else {
                responseHandler.notFound(res, 'Người dùng không tồn tại');
            }
        } catch (err) {
            responseHandler.error(res, 400, err.message);
        }
    }
);

// POST upload/update avatar cho user
router.post("/:id/avatar",
    authHandler.CheckLogin,
    uploadHandler.uploadImage.single('avatar'), // Gọi middleware Multer
    async function (req, res, next) {
        try {
            if (!req.file) {
                return responseHandler.error(res, 400, "Vui lòng chọn ảnh upload");
            }

            let user = await userController.GetAnUserById(req.params.id);
            if (!user) {
                return responseHandler.notFound(res, 'Người dùng không tồn tại');
            }

            // Kiểm tra quyền: chỉ admin hoặc chính user đó
            if (req.user.role.name !== 'admin' && user._id.toString() !== req.user._id.toString()) {
                return responseHandler.forbidden(res, 'Bạn không có quyền sửa ảnh của người dùng này');
            }

            // Đường dẫn tĩnh để truy cập ảnh
            let avatarUrl = '/uploads/' + req.file.filename;

            let updatedItem = await userController.UpdateAnUser(req.params.id, { avatarUrl: avatarUrl });
            if (updatedItem) {
                responseHandler.success(res, 200, updatedItem, 'Cập nhật ảnh đại diện thành công');
            } else {
                responseHandler.notFound(res, 'Lỗi cập nhật ảnh đại diện');
            }
        } catch (err) {
            responseHandler.error(res, 400, err.message);
        }
    }
);

module.exports = router;