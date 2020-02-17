const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);
const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);

const subjectSchema = new mongoose.Schema({
  registration_number: {
    type: String,
    required: true
  },
  class_name: {
    type: String,
    required: true
  },
  subjects: [{}]
});

const studentSubjects = mongoose.model("student_subject", subjectSchema);

module.exports.StudentSubjects = studentSubjects;
