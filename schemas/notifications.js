let mongoose = require('mongoose');

let notificationSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true // Vi du: SYSTEM, BOOKING_SUCCESS, TRIP_CANCELLED
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('notification', notificationSchema);