const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);
const jwt = require("jsonwebtoken");
const config = require("config");
const Joi = require("@hapi/joi");

const teachersSchema = new mongoose.Schema({
  teacherID: {
    type: String,
    unique: true,
    required: true
  },
  username: {
    type: String,
    minlength: 3,
    maxlength: 12,
    unique: true,
    required: true
  },
  password: {
    type: String,
    minlength: 8
  },
  className: {
    type: String,
    minlength: 3,
    maxlength: 8
  },
  role: {
    type: String,
    maxlength: 25,
    required: true
  },
  schoolName: {
    type: String,
    maxlength: 25,
    required: true
  },
  schoolSecretKey: {
    type: String,
    required: true
  },
  numberOfSubject: {
    type: Number,
    required: true
  },
  firstName: {
    type: String,
    minlength: 3,
    maxlength: 18,
    default: "Not Specified"
  },
  lastName: {
    type: String,
    minlength: 3,
    maxlength: 18,
    default: "Not Specified"
  },
  gender: { type: String, default: "Not Specified" },
  dob: { type: Date, default: "01/01/1900" },
  email: {
    type: String,
    minlength: 5,
    maxlength: 255,
    default: "Not Specified"
  },
  phone: {
    type: String,
    maxlength: 15,
    default: "Not Specified"
  },
  address: { type: String, default: "Not Specified" },
  addedBy: {
    type: String,
    required: true
  },
  lastUpdatedBy: {
    type: String
  },
  isTeacher: { type: Boolean }
});

teachersSchema.methods.generateTeacherAuthToken = function() {
  const token = jwt.sign(
    {
      _id: this._id,
      role: this.role,
      gender: this.gender,
      isTeacher: this.isTeacher,
      teacherID: this.teacherID,
      username: this.username,
      schoolName: this.schoolName,
      className: this.className,
      schoolSecretKey: this.schoolSecretKey
    },
    config.get("private_key")
  );
  return token;
};

function validateTeacherDetails(addTeacher) {
  const schema = Joi.object({
    teacherID: Joi.string().required(),
    username: Joi.string()
      .lowercase()
      .min(3)
      .max(12)
      .required(),
    className: Joi.string()
      .min(3)
      .max(12)
  });
  return schema.validate(addTeacher);
}

function validateTeacherAuth(teacher) {
  const schema = Joi.object({
    teacherID: Joi.string().required(),
    username: Joi.string()
      .min(3)
      .required(),
    password: Joi.string()
      .min(8)
      .required(),
    password_again: Joi.ref("password")
  });
  return schema.validate(teacher);
}

function validateTeacherUpdate(teacherUpdate) {
  const schema = Joi.object({
    firstName: Joi.string()
      .min(3)
      .max(18)
      .required(),
    lastName: Joi.string()
      .min(3)
      .max(18),
    gender: Joi.string()
      .min(3)
      .max(14)
      .required(),
    dob: Joi.date().required(),
    email: Joi.string()
      .min(5)
      .max(255)
      .email(),
    phone: Joi.string()
      .max(15)
      .required(),
    address: Joi.string()
      .min(5)
      .max(255)
      .required()
  });
  return schema.validate(teacherUpdate);
}

const TeacherDetails = mongoose.model("teachers", teachersSchema);

module.exports.TeacherDetails = TeacherDetails;
module.exports.ValidateTeacherUpdate = validateTeacherUpdate;
module.exports.ValidateTeacherAuth = validateTeacherAuth;
module.exports.validateTeacherDetails = validateTeacherDetails;
