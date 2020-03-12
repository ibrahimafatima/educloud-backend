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
    unique: true
  },
  class_name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 8
  },
  password: {
    type: String,
    minlength: 8
  },
  username: {
    type: String,
    minlength: 3,
    maxlength: 12
  },
  first_name: {
    type: String,
    minlength: 3,
    maxlength: 18
  },
  last_name: {
    type: String,
    minlength: 3,
    maxlength: 18
  },
  year: { type: String },
  term: {
    type: String,
    minlength: 3,
    maxlength: 20
  },
  gender: { type: String },
  father_name: { type: String },
  mother_name: { type: String },
  dob: { type: Date },
  email: {
    type: String,
    minlength: 8,
    maxlength: 255
  },
  address: { type: String, minlength: 6, maxlength: 255 },
  phone: {
    type: String,
    minlength: 10,
    maxlength: 10
  },
  isRegistered: { type: Boolean },
  isStudent: { type: Boolean }
});

studentSchema.methods.generateStudentToken = function() {
  const token = jwt.sign(
    {
      _id: this._id,
      registration_number: this.registration_number,
      username: this.username,
      class_name: this.class_name,
      isStudent: this.isStudent
    },
    config.get("private_key")
  );
  return token;
};

const studentDetails = mongoose.model("students", studentSchema);

function validateStudentDetails(addStudent) {
  const schema = Joi.object({
    registration_number: Joi.string().required(),
    username: Joi.string()
      .min(3)
      .max(12)
      .required(),
    class_name: Joi.string()
      .lowercase()
      .min(3)
      .max(8)
      .required(),
    term: Joi.string()
      .required()
      .min(3)
      .max(20)
      .required(),
    year: Joi.string().required()
  });
  return schema.validate(addStudent);
}

function validateStudentAuth(student) {
  const schema = Joi.object({
    registration_number: Joi.string().required(),
    username: Joi.string()
      .min(3)
      .max(12)
      .required(),
    class_name: Joi.string()
      .min(3)
      .max(8)
      .required(),
    password: Joi.string()
      .min(8)
      .required(),
    password_again: Joi.ref("password")
  });
  return schema.validate(student);
}

function validateStudentUpdate(studentUpdate) {
  const schema = Joi.object({
    first_name: Joi.string()
      .min(3)
      .max(18)
      .required(),
    last_name: Joi.string()
      .min(3)
      .max(18),
    gender: Joi.string()
      .min(3)
      .max(10)
      .required(),
    father_name: Joi.string()
      .min(3)
      .max(18),
    mother_name: Joi.string()
      .min(3)
      .max(18),
    dob: Joi.date().required(),
    email: Joi.string()
      .min(5)
      .max(255)
      .email(),
    phone: Joi.string()
      .min(10)
      .max(10),
    address: Joi.string()
      .min(5)
      .max(255)
      .required()
  });
  return schema.validate(studentUpdate);
}

module.exports.ValidateStudentDetails = validateStudentDetails;
module.exports.ValidateStudentAuth = validateStudentAuth;
module.exports.ValidateStudentUpdate = validateStudentUpdate;
module.exports.StudentDetails = studentDetails;
