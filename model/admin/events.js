const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);
const Joi = require("@hapi/joi");

const eventSchema = new mongoose.Schema({
  posted_by: {
    type: String,
    minlength: 3,
    maxlength: 30
  },

  event_date: {
    type: Date,
    required: true
  },
  post_date: {
    type: Date,
    default: Date.now
  },
  event_message: {
    type: String,
    minlength: 5,
    maxlength: 255,
    required: true
  },
  schoolSecretKey: {
    type: String,
    required: true
  }
});

function validateEvent(events) {
  const schema = Joi.object({
    event_date: Joi.required(),
    event_message: Joi.string()
      .min(5)
      .max(255)
      .required()
  });
  return schema.validate(events);
}

const event = mongoose.model("events", eventSchema);

module.exports.Event = event;
module.exports.ValidateEvent = validateEvent;
