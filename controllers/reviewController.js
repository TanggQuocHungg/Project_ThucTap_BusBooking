let reviewModel = require('../schemas/reviews')
let ticketModel = require('../schemas/tickets')

module.exports = {
    CreateAReview: async function (user, trip, rating, comment) {
        try {
            // 1. VALIDATE: Kiểm tra user chưa review chuyến này
            let existReview = await reviewModel.findOne({
                user: user,
                trip: trip,
                isDeleted: false
            });

            if (existReview) {
                throw new Error("Bạn đã review chuyến xe này rồi");
            }

            // 2. VALIDATE: Kiểm tra user đã đặt và hoàn thành chuyến này
            let ticket = await ticketModel.findOne({
                user: user,
                trip: trip,
                status: 'CONFIRMED',
                isDeleted: false
            });

            if (!ticket) {
                throw new Error("Bạn phải hoàn thành chuyến xe này mới có thể review");
            }

            // 3. TẠO REVIEW
            let newItem = new reviewModel({
                user: user,
                trip: trip,
                rating: rating,
                comment: comment
            });
            await newItem.save();
            return newItem;
        } catch (error) {
            throw error;
        }
    },

    GetAllReviews: async function (tripId) {
        let condition = { isDeleted: false };
        if (tripId) {
            condition.trip = tripId;
        }
        return await reviewModel.find(condition)
            .populate('user', 'username fullName avatarUrl')
            .sort({ createdAt: -1 })
    },

    GetAReviewById: async function (id) {
        let result = await reviewModel.findOne({
            isDeleted: false,
            _id: id
        }).populate('user', 'username fullName avatarUrl')
        
        if (result) {
            return result;
        }
        return false;
    },

    UpdateAReview: async function (id, updateData) {
        // VALIDATE: Chỉ cho update rating và comment
        let allowedFields = ['rating', 'comment'];
        let cleanData = {};
        
        for (let field of allowedFields) {
            if (updateData[field] !== undefined) {
                cleanData[field] = updateData[field];
            }
        }

        let updatedItem = await reviewModel.findOneAndUpdate({
            isDeleted: false,
            _id: id
        }, cleanData, { new: true })

        if (updatedItem) {
            return updatedItem;
        }
        return false;
    },

    DeleteAReview: async function (id) {
        let updatedItem = await reviewModel.findOneAndUpdate({
            isDeleted: false,
            _id: id
        }, {
            isDeleted: true
        }, { new: true })

        if (updatedItem) {
            return updatedItem;
        }
        return false;
    }
}