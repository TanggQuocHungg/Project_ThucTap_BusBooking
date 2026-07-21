let mongoose = require('mongoose');

let ticketSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    trip: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'trip',
        required: true
    },
    seats: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'seat' // Luu mang cac ghe da chon
    }],
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        default: "PENDING" // PENDING, SUCCESS, CANCELLED
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('ticket', ticketSchema);