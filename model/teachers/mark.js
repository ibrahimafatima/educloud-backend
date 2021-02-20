const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);
const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);

const markSchema = new mongoose.Schema({
  registrationID: {
    type: String,
    required: true,
  },
  studentName: {
    type: String,
  },
  name: {
    type: String,
    required: true,
  },
  examName: {
    type: String,
    required: true,
  },
  mark: {
    type: Number,
    required: true,
  },
  grade: {
    type: String,
  },
  remark: {
    type: String,
  },
  schoolSecretKey: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: "New",
  },
});

function validateMark(mark) {
  const schema = Joi.object({
    name: Joi.string().max(30).required(),
    mark: Joi.number().required(),
    grade: Joi.string().max(20),
    remark: Joi.string().min(3).max(255),
    examName: Joi.string().max(25).required(),
  });
  return schema.validate(mark);
}

const mark = mongoose.model("student_mark", markSchema);

module.exports.Mark = mark;
module.exports.ValidateMark = validateMark;
