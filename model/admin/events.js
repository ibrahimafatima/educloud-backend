const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);
const Joi = require("@hapi/joi");

const eventSchema = new mongoose.Schema({
  event_title: {
    type: String,
    minlength: 5,
    maxlength: 30,
    required: true
  },

  event_date: {
    type: Date,
    required: true
  },
  event_message: {
    type: String,
    minlength: 5,
    maxlength: 255,
    required: true
  }
});

function validateEvent(events) {
  const schema = Joi.object({
    event_title: Joi.string()
      .max(30)
      .min(5)
      .required(),
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
