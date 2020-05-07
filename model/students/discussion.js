const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);
const Joi = require("@hapi/joi");

const discussionSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  sender: {
    type: String,
    required: true,
  },
  classe: {
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
  date: {
    type: Date,
    default: Date.now,
  },
  timestamp: {
    type: String,
  },
});

function validateDiscussion(discussion) {
  const schema = Joi.object({
    message: Joi.string().required(),
  });
  return schema.validate(discussion);
}

const discussion = mongoose.model("discussions", discussionSchema);

module.exports.Discussion = discussion;
module.exports.ValidateDiscussion = validateDiscussion;
