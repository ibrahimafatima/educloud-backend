const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);
const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);

const teacherCourseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  className: {
    type: String,
    required: true,
  },
  schoolSecretKey: {
    type: String,
    required: true,
  },
  registrationID: {
    type: String,
    required: true,
  },
});

const TeachersCourse = mongoose.model("teacher_courses", teacherCourseSchema);

function validateCourseAdded(course) {
  const schema = Joi.object({
    name: Joi.string().max(30).required(),
    className: Joi.string().min(3).max(12).required(),
    schoolSecretKey: Joi.string(),
    registrationID: Joi.string(),
  });
  return schema.validate(course);
}

module.exports.TeachersCourse = TeachersCourse;
module.exports.ValidateCourseAdded = validateCourseAdded;
