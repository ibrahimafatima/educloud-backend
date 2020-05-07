const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);
const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);

const timetableSchema = new mongoose.Schema({
  className: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  day: {
    type: String,
    required: true
  },
  dayNum: {
    type: Number
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  teacherID: {
    type: String,
    required: true
  },
  teacherUsername: {
    type: String,
    required: true
  },
  schoolSecretKey: {
    type: String,
    required: true
  }
});

const Timetable = mongoose.model("timetable", timetableSchema);

function validateTimetable(table) {
  const schema = Joi.object({
    className: Joi.string()
      .max(15)
      .required(),
    name: Joi.string()
      .max(20)
      .required(),
    day: Joi.string()
      .min(3)
      .max(12)
      .required(),
    startTime: Joi.string()
      .max(10)
      .required(),
    endTime: Joi.string()
      .max(10)
      .required()
  });
  return schema.validate(table);
}

module.exports.Timetable = Timetable;
module.exports.ValidateTimetable = validateTimetable;
