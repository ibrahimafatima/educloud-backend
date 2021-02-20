const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);
const jwt = require("jsonwebtoken");
const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);
const config = require("config");

const studentSchema = new mongoose.Schema({
  registrationID: {
    type: String,
    required: true,
  },
  schoolSecretKey: {
    type: String,
    required: true,
  },
  className: {
    type: String,
    required: true,
  },
  password: {
    type: String,
  },
  username: {
    type: String,
    unique: true,
  },
  term: {
    type: String,
  },
  gender: { type: String, default: "Not Specified" },
  fatherName: { type: String, default: "Not Specified" },
  motherName: { type: String, default: "Not Specified" },
  dob: { type: Date, default: "01/01/1900" },
  email: {
    type: String,
    default: "Not Specified",
  },
  feePaid: {
    type: Number,
    default: 0,
  },
  address: {
    type: String,
    default: "Not Specified",
  },
  phone: {
    type: String,
    default: "Not Specified",
  },
  role: {
    type: String,
    required: true,
  },
  schoolName: {
    type: String,
    required: true,
  },
  profileURL: {
    type: String,
    default: "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
  },
  isStudent: { type: Boolean, default: false },
  country: {
    type: String,
    required: true
  },
  pack: {
    type: String,
    required: true
  }
});

studentSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      pack: this.pack,
      registrationID: this.registrationID,
      schoolSecretKey: this.schoolSecretKey,
      username: this.username,
      role: this.role,
      country: this.country,
      gender: this.gender,
      schoolName: this.schoolName,
      className: this.className,
      isStudent: this.isStudent,
      profileURL: this.profileURL
    },
    config.get("private_key")
  );
  return token;
};

const StudentDetails = mongoose.model("students", studentSchema);

function validateStudentDetails(addStudent) {
  const schema = Joi.object({
    registrationID: Joi.string().required(),
    username: Joi.string().min(3).max(15).required(),
    className: Joi.string().lowercase().min(3).max(12).required(),
    term: Joi.string().required().min(3).max(20).required(),
  });
  return schema.validate(addStudent);
}

function validateStudentLogin(student) {
  const schema = Joi.object({
    username: Joi.string().min(3).max(15).required(),
    password: Joi.string().min(8).max(20).required(),
    password_again: Joi.ref("password"),
  });
  return schema.validate(student);
}

function validateStudentUpdate(studentUpdate) {
  const schema = Joi.object({
    fatherName: Joi.string().min(3).max(20),
    motherName: Joi.string().min(3).max(20),
    gender: Joi.string().min(3).max(15),
    email: Joi.string().min(5).max(255).email(),
    dob: Joi.string(),
    phone: Joi.string(),
    address: Joi.string().min(5).max(255),
  });
  return schema.validate(studentUpdate);
}

module.exports.validateStudentDetails = validateStudentDetails;
module.exports.validateStudentLogin = validateStudentLogin;
module.exports.validateStudentUpdate = validateStudentUpdate;
module.exports.StudentDetails = StudentDetails;
