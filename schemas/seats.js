let mongoose = require('mongoose');

let seatSchema = mongoose.Schema({
    trip: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'trip',
        required: true
    },
    seatNumber: {
        type: String,
        required: true // Vi du: A1, A2, B1, B2
    },
    status: {
        type: String,
        default: "AVAILABLE" // AVAILABLE, HOLD, BOOKED
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('seat', seatSchema);