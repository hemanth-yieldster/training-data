const mongoose = require('mongoose')

const balancerV2Schema = mongoose.Schema({
    poolAddress: {
        type: String,
        required: true
    },
    assetAddress: [{
        type: String,
        required: true
    }],
    assetBalance: [{
        type: String,
        required: true,
    }],
    normalizedWeight: [{
        type: String,
        required: true,
    }],
    V: {
        type: String,
        require: true
    },
    timeStamp: {
        type: String,
        required: true
    }
}, {
    versionKey: false,
    timestamps: true
})

module.exports = mongoose.model('balancerV2PoolData', balancerV2Schema)