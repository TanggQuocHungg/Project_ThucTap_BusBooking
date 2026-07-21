let mongoose = require('mongoose');

let tripSchema = mongoose.Schema({
    route: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'route',
        required: true
    },
    bus: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'bus',
        required: true
    },
    departureTime: {
        type: Date,
        required: true
    },
    arrivalTime: {
        type: Date,
        required: true
    },
    price: {
        type: Number,
        required: true // Gia cu the cho chuyen di nay (co the tang vao le tet)
    },
    status: {
        type: String,
        default: "PENDING" // PENDING, RUNNING, COMPLETED, CANCELLED
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('trip', tripSchema);