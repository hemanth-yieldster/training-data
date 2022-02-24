const mongoose = require('mongoose')

const kyberSchema = mongoose.Schema({
    poolAddress: {
        type: String,
        required: true
    },
    a1: {
        type: String,
        required: true
    },
    a2: {
        type: String,
        required: true,
    },
    x: {
        type: String,
        required: true,
    },
    y: {
        type: String,
        required: true,
    },
    kaSquare: {
        type: String,
        required: true,
    },
    timeStamp: {
        type: String,
        required: true
    },
    assetAddress: [{
        type: String,
        required: true
    }]
}, {
    versionKey: false,
    // timestamps: true
})

module.exports = mongoose.model('kyberPoolData', kyberSchema)