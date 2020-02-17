const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);
const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);

const markSchema = new mongoose.Schema({
  registration_number: {
    type: String,
    required: true
  },
  student_name: {
    type: String,
    minlength: 3,
    maxlength: 25
  },
  subject: {
    type: String,
    required: true,
    maxlength: 30
  },
  exam_name: {
    type: String,
    maxlength: 25,
    required: true
  },
  mark: {
    type: Number,
    required: true
  },
  grade: {
    type: String,
    maxlength: 20
  },
  remark: {
    type: String,
    minlength: 3,
    maxlength: 255
  }
});

function validateMark(mark) {
  const schema = Joi.object({
    registration_number: Joi.string().required(),
    student_name: Joi.string()
      .min(3)
      .max(25),
    subject: Joi.string()
      .max(30)
      .required(),
    mark: Joi.number().required(),
    grade: Joi.string().max(20),
    remark: Joi.string()
      .min(3)
      .max(255),
    exam_name: Joi.string()
      .max(25)
      .required()
  });
  return schema.validate(mark);
}

const mark = mongoose.model("student_mark", markSchema);

module.exports.Mark = mark;
module.exports.ValidateMark = validateMark;
