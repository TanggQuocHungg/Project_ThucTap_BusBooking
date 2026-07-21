var express = require("express");
var router = express.Router();
let reviewController = require('../controllers/reviewController');
let validator = require('../utils/validator');
let authHandler = require('../utils/authHandler');
let responseHandler = require('../utils/responseHandler');

// GET reviews của trip
router.get("/", async function (req, res, next) {
    try {
        let tripId = req.query.tripId;
        let result = await reviewController.GetAllReviews(tripId);
        responseHandler.success(res, 200, result, 'Lấy danh sách đánh giá thành công');
    } catch (err) {
        responseHandler.error(res, 400, err.message);
    }
});

// GET review theo id
router.get("/:id", async function (req, res, next) {
    try {
        let result = await reviewController.GetAReviewById(req.params.id);
        if (result) {
            responseHandler.success(res, 200, result, 'Lấy thông tin đánh giá thành công');
        } else {
            responseHandler.notFound(res, 'Đánh giá không tồn tại');
        }
    } catch (err) {
        responseHandler.error(res, 400, err.message);
    }
});

// CREATE review (customer)
router.post("/", 
    authHandler.CheckLogin,
    authHandler.CheckRole('customer'),
    validator.CreateReviewValidator,
    validator.validatedResult,
    async function (req, res, next) {
        try {
            let newItem = await reviewController.CreateAReview(
                req.user._id,
                req.body.trip,
                req.body.rating,
                req.body.comment
            );
            responseHandler.success(res, 201, newItem, 'Tạo đánh giá thành công');
        } catch (err) {
            responseHandler.error(res, 400, err.message);
        }
    }
);

// UPDATE review (chủ review)
router.put("/:id", 
    authHandler.CheckLogin,
    validator.UpdateReviewValidator,
    validator.validatedResult,
    async function (req, res, next) {
        try {
            let review = await reviewController.GetAReviewById(req.params.id);
            if (!review) {
                responseHandler.notFound(res, 'Đánh giá không tồn tại');
                return;
            }

            // Kiểm tra quyền: chỉ admin hoặc chủ đánh giá mới được sửa
            if (req.user.role.name !== 'admin' && review.user._id.toString() !== req.user._id.toString()) {
                responseHandler.forbidden(res, 'Bạn không có quyền sửa đánh giá này');
                return;
            }

            let updatedItem = await reviewController.UpdateAReview(req.params.id, req.body);
            if (updatedItem) {
                responseHandler.success(res, 200, updatedItem, 'Cập nhật đánh giá thành công');
            } else {
                responseHandler.notFound(res, 'Đánh giá không tồn tại');
            }
        } catch (err) {
            responseHandler.error(res, 400, err.message);
        }
    }
);

// DELETE review (chủ review hoặc admin)
router.delete("/:id", 
    authHandler.CheckLogin,
    validator.DeleteReviewValidator,
    validator.validatedResult,
    async function (req, res, next) {
        try {
            let review = await reviewController.GetAReviewById(req.params.id);
            if (!review) {
                responseHandler.notFound(res, 'Đánh giá không tồn tại');
                return;
            }

            // Kiểm tra quyền
            if (req.user.role.name !== 'admin' && review.user._id.toString() !== req.user._id.toString()) {
                responseHandler.forbidden(res, 'Bạn không có quyền xóa đánh giá này');
                return;
            }

            let updatedItem = await reviewController.DeleteAReview(req.params.id);
            if (updatedItem) {
                responseHandler.success(res, 200, updatedItem, 'Xóa đánh giá thành công');
            } else {
                responseHandler.notFound(res, 'Đánh giá không tồn tại');
            }
        } catch (err) {
            responseHandler.error(res, 400, err.message);
        }
    }
);

module.exports = router;