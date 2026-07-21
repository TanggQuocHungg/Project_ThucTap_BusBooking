let notificationModel = require('../schemas/notifications')

module.exports = {
    CreateANotification: async function (user, message, type) {
        let newItem = new notificationModel({
            user: user,
            message: message,
            type: type // Vi du: "SYSTEM", "BOOKING_SUCCESS"
        });
        await newItem.save();
        return newItem;
    },

    GetAllNotifications: async function (userId) {
        let condition = { isDeleted: false };
        if (userId) condition.user = userId; 
        return await notificationModel.find(condition)
            .populate('user', 'username fullName') 
            .sort({ createdAt: -1 });
    },

    GetANotificationById: async function (id) {
        let result = await notificationModel.findOne({
            isDeleted: false,
            _id: id
        })
        if (result) {
            return result;
        }
        return false;
    },

    UpdateANotification: async function (id, updateData) {
        let updatedItem = await notificationModel.findOneAndUpdate({
            isDeleted: false,
            _id: id
        }, updateData, { new: true })

        if (updatedItem) {
            return updatedItem;
        }
        return false;
    },

    DeleteANotification: async function (id) {
        let updatedItem = await notificationModel.findOneAndUpdate({
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