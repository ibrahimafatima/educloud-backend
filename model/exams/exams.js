const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);
const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);

const examSchema = new mongoose.Schema({
  className: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  examName: {
    type: String,
    required: true,
  },
  scheduledDate: {
    type: Date,
    required: true,
  },
  scheduledTime: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  postDate: {
    type: Date,
    default: new Date(),
  },
  teacherRegID: {
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
  schoolName: {
    type: String,
    required: true,
  },
});

function validateExams(exam) {
  const schema = Joi.object({
    className: Joi.string().min(3).max(8).required(),
    examName: Joi.string().min(3).max(20).required(),
    scheduledDate: Joi.date().required(),
    scheduledTime: Joi.string().required(),
    duration: Joi.string().required(),
    subject: Joi.string().max(50).required(),
  });
  return schema.validate(exam);
}

const exams = mongoose.model("exams", examSchema);

module.exports.Exams = exams;
module.exports.ValidateExams = validateExams;
