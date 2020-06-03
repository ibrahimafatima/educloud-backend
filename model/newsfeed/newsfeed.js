const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);
const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);

const newsfeedSchema = new mongoose.Schema({
  post_date: {
    type: Date,
    default: new Date(),
  },
  username: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  post_text: {
    type: String,
    required: true,
  },
  schoolName: {
    type: String,
    required: true,
  },
  schoolSecretKey: {
    type: String,
    required: true,
  },
});

const newsfeed = mongoose.model("newsfeed", newsfeedSchema);

module.exports.Newsfeed = newsfeed;
