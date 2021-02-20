const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);
const jwt = require("jsonwebtoken");
const config = require("config");
const Joi = require("@hapi/joi");

const teachersSchema = new mongoose.Schema({
  registrationID: {
    type: String,
    unique: true,
    required: true,
  },
  username: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
  },
  className: {
    type: String,
  },
  role: {
    type: String,
    required: true,
  },
  schoolName: {
    type: String,
    required: true,
  },
  schoolSecretKey: {
    type: String,
    required: true,
  },
  numberOfSubject: {
    type: Number,
    required: true,
  },
  firstName: {
    type: String,
    default: "Not Defined",
  },
  lastName: {
    type: String,
    default: "Not Defined",
  },
  gender: { type: String, default: "Not Defined" },
  dob: { type: Date, default: "01/01/1900" },
  email: {
    type: String,
    default: "Not Defined",
  },
  phone: {
    type: String,
    default: "Not Defined",
  },
  profileURL: {
    type: String,
    default: "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
  },
  address: { type: String, default: "Not Defined" },
  addedBy: {
    type: String,
    required: true,
  },
  lastUpdatedBy: {
    type: String,
  },
  isTeacher: { type: Boolean, default: true },
  country: {
    type: String,
    required: true
  },
  pack: {
    type: String,
    required: true
  }
});

teachersSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      pack: this.pack,
      role: this.role,
      gender: this.gender,
      country: this.country,
      isTeacher: this.isTeacher,
      registrationID: this.registrationID,
      username: this.username,
      schoolName: this.schoolName,
      className: this.className,
      profileURL: this.profileURL,
      schoolSecretKey: this.schoolSecretKey,
    },
    config.get("private_key")
  );
  return token;
};

function validateTeacherDetails(addTeacher) {
  const schema = Joi.object({
    registrationID: Joi.string().required(),
    username: Joi.string().lowercase().min(3).max(15).required(),
    className: Joi.string().min(3).max(12),
  });
  return schema.validate(addTeacher);
}

function validateTeacherLogin(teacher) {
  const schema = Joi.object({
    username: Joi.string().min(3).max(15).required(),
    password: Joi.string().min(8).max(20).required(),
    password_again: Joi.ref("password"),
  });
  return schema.validate(teacher);
}

function validateTeacherUpdate(teacherUpdate) {
  const schema = Joi.object({
    firstName: Joi.string().min(3).max(20).required(),
    lastName: Joi.string().min(3).max(20).required(),
    gender: Joi.string().min(3).max(15).required(),
    dob: Joi.date().required(),
    email: Joi.string().min(5).max(255).email(),
    phone: Joi.string().max(15),
    address: Joi.string().min(5).max(255).required(),
  });
  return schema.validate(teacherUpdate);
}

const TeacherDetails = mongoose.model("teachers", teachersSchema);

module.exports.TeacherDetails = TeacherDetails;
module.exports.validateTeacherUpdate = validateTeacherUpdate;
module.exports.validateTeacherLogin = validateTeacherLogin;
module.exports.validateTeacherDetails = validateTeacherDetails;
