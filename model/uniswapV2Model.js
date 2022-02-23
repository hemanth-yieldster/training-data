const mongoose = require('mongoose')

const uniswapV2Schema = mongoose.Schema({
    poolAddress: {
        type: String,
        required: true
    },
    x: {
        type: String,
        required: true
    },
    y: {
        type: String,
        required: true,
    },
    k: {
        type: String,
        required: true,
    },
    timeStamp: {
        type: String,
        required: true
    }
}, {
    versionKey: false,
    timestamps: true
})

module.exports = mongoose.model('uniswapV2PoolData', uniswapV2Schema)