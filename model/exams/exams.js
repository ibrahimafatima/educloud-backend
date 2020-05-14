const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);
const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);

const examSchema = new mongoose.Schema({
  className: {
    type: String,
    minlength: 3,
    maxlength: 8,
    required: true,
  },
  subject: {
    type: String,
    maxlength: 50,
    required: true,
  },
  exam_name: {
    type: String,
    minlength: 3,
    maxlength: 50,
    required: true,
  },
  schedule_date: {
    type: Date,
    required: true,
  },
  schedule_time: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  post_date: {
    type: Date,
    default: new Date(),
  },
  teacherID: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: "New",
  },
  schoolSecretKey: {
    type: String,
    required: true,
  },
});

function validateExams(exam) {
  const schema = Joi.object({
    className: Joi.string().min(3).max(8).required(),
    exam_name: Joi.string().min(3).max(20).required(),
    schedule_date: Joi.date().required(),
    schedule_time: Joi.string().required(),
    duration: Joi.string().required(),
    subject: Joi.string().max(50).required(),
  });
  return schema.validate(exam);
}

const exams = mongoose.model("exams", examSchema);

module.exports.Exams = exams;
module.exports.ValidateExams = validateExams;
