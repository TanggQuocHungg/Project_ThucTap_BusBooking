let mongoose = require('mongoose');

let busSchema = mongoose.Schema({
    licensePlate: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true // Vi du: LIMOUSINE_22, SLEEPER_34
    },
    capacity: {
        type: Number,
        required: true
    },
    imageUrl: { 
        type: String, 
        default: '' 
    },

    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('bus', busSchema);