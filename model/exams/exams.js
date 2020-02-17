const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);
const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);

const examSchema = new mongoose.Schema({
  class_name: {
    type: String,
    minlength: 3,
    maxlength: 8,
    required: true
  },
  subject: {
    type: String,
    maxlength: 50,
    required: true
  },
  exam_name: {
    type: String,
    minlength: 3,
    maxlength: 50,
    required: true
  },
  schedule_date: {
    type: Date,
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "teachers"
  }
});

function validateExams(exam) {
  const schema = Joi.object({
    class_name: Joi.string()
      .min(3)
      .max(8)
      .required(),
    exam_name: Joi.string()
      .min(3)
      .max(50)
      .required(),
    schedule_date: Joi.date().required(),
    subject: Joi.string()
      .max(50)
      .required()
  });
  return schema.validate(exam);
}

const exams = mongoose.model("exams", examSchema);

module.exports.Exams = exams;
module.exports.ValidateExams = validateExams;
