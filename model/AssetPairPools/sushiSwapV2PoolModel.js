const mongoose = require("mongoose");

const sushiSwapV2Schema = mongoose.Schema(
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

module.exports = mongoose.model(
  "sushiSwapV2FactoryPoolData",
  sushiSwapV2Schema
);
