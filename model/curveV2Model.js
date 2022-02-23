const mongoose = require("mongoose");

const curveV2Model = mongoose.Schema(
  {
    poolAddress: {
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
    D: {
      type: String,
      required: true,
    },
    timeStamp: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("curveV2", curveV2Model);
