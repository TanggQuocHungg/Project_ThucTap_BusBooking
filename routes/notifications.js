var express = require("express");
var router = express.Router();
let notificationController = require('../controllers/notificationController');
let authHandler = require('../utils/authHandler');
let responseHandler = require('../utils/responseHandler');

// GET notifications của user
router.get("/", 
    authHandler.CheckLogin,
    async function (req, res, next) {
        try {
            let userId = req.query.userId;
            
            // User thường chỉ xem được thông báo của mình
            if (req.user.role.name !== 'admin' && userId && userId !== req.user._id.toString()) {
                responseHandler.forbidden(res, 'Bạn chỉ được xem thông báo của mình');
                return;
            }

            // Nếu user thường, mặc định xem thông báo của chính mình
            if (req.user.role.name !== 'admin') {
                userId = req.user._id;
            }

            let result = await notificationController.GetAllNotifications(userId);
            responseHandler.success(res, 200, result, 'Lấy danh sách thông báo thành công');
        } catch (err) {
            responseHandler.error(res, 400, err.message);
        }
    }
);

// GET notification theo id
router.get("/:id", 
    authHandler.CheckLogin,
    async function (req, res, next) {
        try {
            let result = await notificationController.GetANotificationById(req.params.id);
            if (result) {
                // Kiểm tra quyền
                if (req.user.role.name !== 'admin' && result.user.toString() !== req.user._id.toString()) {
                    responseHandler.forbidden(res, 'Bạn không có quyền xem thông báo này');
                    return;
                }
                responseHandler.success(res, 200, result, 'Lấy thông tin thông báo thành công');
            } else {
                responseHandler.notFound(res, 'Thông báo không tồn tại');
            }
        } catch (err) {
            responseHandler.error(res, 400, err.message);
        }
    }
);

// CREATE notification (chỉ admin - gửi thông báo cho user)
router.post("/", 
    authHandler.CheckLogin,
    authHandler.CheckRole('admin'),
    async function (req, res, next) {
        try {
            let newItem = await notificationController.CreateANotification(
                req.body.user,
                req.body.message,
                req.body.type
            );
            responseHandler.success(res, 201, newItem, 'Tạo thông báo thành công');
        } catch (err) {
            responseHandler.error(res, 400, err.message);
        }
    }
);

// UPDATE notification (chỉ admin)
router.put("/:id", 
    authHandler.CheckLogin,
    authHandler.CheckRole('admin'),
    async function (req, res, next) {
        try {
            let updatedItem = await notificationController.UpdateANotification(req.params.id, req.body);
            if (updatedItem) {
                responseHandler.success(res, 200, updatedItem, 'Cập nhật thông báo thành công');
            } else {
                responseHandler.notFound(res, 'Thông báo không tồn tại');
            }
        } catch (err) {
            responseHandler.error(res, 400, err.message);
        }
    }
);

// DELETE notification (chỉ admin)
router.delete("/:id", 
    authHandler.CheckLogin,
    authHandler.CheckRole('admin'),
    async function (req, res, next) {
        try {
            let updatedItem = await notificationController.DeleteANotification(req.params.id);
            if (updatedItem) {
                responseHandler.success(res, 200, updatedItem, 'Xóa thông báo thành công');
            } else {
                responseHandler.notFound(res, 'Thông báo không tồn tại');
            }
        } catch (err) {
            responseHandler.error(res, 400, err.message);
        }
    }
);

module.exports = router;