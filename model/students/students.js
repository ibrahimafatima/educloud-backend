const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);
const jwt = require("jsonwebtoken");
const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);
const config = require("config");

const studentSchema = new mongoose.Schema({
  registration_number: {
    type: String,
    required: true,
    unique: true,
  },
  schoolSecretKey: {
    type: String,
    required: true,
  },
  class_name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 8,
  },
  password: {
    type: String,
    minlength: 8,
  },
  name: {
    type: String,
    minlength: 3,
    maxlength: 25,
  },
  term: {
    type: String,
    minlength: 3,
    maxlength: 20,
  },
  gender: { type: String, default: "Not Specified" },
  father_name: { type: String, default: "Not Specified" },
  mother_name: { type: String, default: "Not Specified" },
  dob: { type: Date, default: "01/01/1900" },
  email: {
    type: String,
    minlength: 8,
    maxlength: 255,
    default: "Not Specified",
  },
  fee_paid: {
    type: Number,
    default: 0,
  },
  address: {
    type: String,
    default: "Not Specified",
  },
  phone: {
    type: String,
    maxlength: 15,
    default: "Not Specified",
  },
  isRegistered: { type: Boolean },
  role: {
    type: String,
    required: true,
  },
  schoolName: {
    type: String,
    required: true,
  },
  isStudent: { type: Boolean },
});

studentSchema.methods.generateStudentToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      registration_number: this.registration_number,
      schoolSecretKey: this.schoolSecretKey,
      username: this.name,
      role: this.role,
      gender: this.gender,
      schoolName: this.schoolName,
      class_name: this.class_name,
      isStudent: this.isStudent,
    },
    config.get("private_key")
  );
  return token;
};

const studentDetails = mongoose.model("students", studentSchema);

function validateStudentDetails(addStudent) {
  const schema = Joi.object({
    registration_number: Joi.string().required(),
    name: Joi.string().min(3).max(25).required(),
    class_name: Joi.string().lowercase().min(3).max(8).required(),
    term: Joi.string().required().min(3).max(20).required(),
  });
  return schema.validate(addStudent);
}

function validateStudentAuth(student) {
  const schema = Joi.object({
    registration_number: Joi.string().required(),
    name: Joi.string().min(3).max(12),
    class_name: Joi.string().min(3).max(8),
    password: Joi.string().min(8).required(),
    password_again: Joi.ref("password"),
  });
  return schema.validate(student);
}

function validateStudentUpdate(studentUpdate) {
  const schema = Joi.object({
    father_name: Joi.string().min(3).max(18),
    mother_name: Joi.string().min(3).max(18),
    gender: Joi.string().min(3).max(15),
    email: Joi.string().min(5).max(255).email(),
    dob: Joi.string(),
    phone: Joi.string(),
    address: Joi.string().min(5).max(255),
  });
  return schema.validate(studentUpdate);
}

module.exports.ValidateStudentDetails = validateStudentDetails;
module.exports.ValidateStudentAuth = validateStudentAuth;
module.exports.ValidateStudentUpdate = validateStudentUpdate;
module.exports.StudentDetails = studentDetails;
