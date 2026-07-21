let mongoose = require('mongoose');

let routeSchema = mongoose.Schema({
    startStation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'station',
        required: true
    },
    endStation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'station',
        required: true
    },
    distance: {
        type: Number,
        required: true
    },
    basePrice: {
        type: Number,
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('route', routeSchema);