const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);
const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);

const teacherCourseSchema = new mongoose.Schema({
  courseName: {
    type: String,
    required: true
  },
  className: {
    type: String,
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "teachers"
  }
});

const TeachersCourse = mongoose.model("teacher_courses", teacherCourseSchema);

function validateCourseAdded(course) {
  const schema = Joi.object({
    courseName: Joi.string()
      .max(20)
      .required(),
    className: Joi.string()
      .min(3)
      .max(8)
      .required(),
    teacher: Joi.objectId()
  });
  return schema.validate(course);
}

module.exports.TeachersCourse = TeachersCourse;
module.exports.ValidateCourseAdded = validateCourseAdded;
