const mongoose = require("mongoose");

const uniswapV2Schema = mongoose.Schema(
  {
    poolAddress: {
      type: String,
      required: true,
    },
    asset1: {
      type: String,
      required: true,
    },
    asset2: {
      type: String,
      required: true,
    },
    asset1Reserve: {
      type: String,
      required: true,
    },
    asset2Reserve: {
      type: String,
      required: true,
    },
    timeStamp: {
      type: String,
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = mongoose.model("uniswapV2FactoryPoolData", uniswapV2Schema);
