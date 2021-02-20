const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);
const Joi = require("@hapi/joi");

const eventSchema = new mongoose.Schema({
  postedBy: {
    type: String,
  },

  eventDate: {
    type: Date,
    required: true,
  },
  postDate: {
    type: Date,
    default: Date.now,
  },
  eventMessage: {
    type: String,
    required: true,
  },
  schoolSecretKey: {
    type: String,
    required: true,
  },
  schoolName: {
    type: String,
    required: true,
  },
});

function validateEvent(events) {
  const schema = Joi.object({
    eventDate: Joi.required(),
    eventMessage: Joi.string().min(5).max(255).required(),
  });
  return schema.validate(events);
}

const event = mongoose.model("events", eventSchema);

module.exports.Event = event;
module.exports.ValidateEvent = validateEvent;
