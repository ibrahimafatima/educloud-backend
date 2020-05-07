const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);
const config = require("config");
const jwt = require("jsonwebtoken");
const Joi = require("@hapi/joi");

const adminAuthSchema = new mongoose.Schema({
  schoolSecretKey: {
    type: String,
    required: true,
  },
  schoolName: {
    type: String,
    required: true,
    maxlength: 15,
  },
  username: {
    type: String,
    minlength: 3,
    maxlength: 12,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    minlength: 8,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  currency: {
    type: String,
    required: true,
  },
  isAdmin: { type: Boolean },
});

function validateAdminAuth(admin) {
  const schema = Joi.object({
    schoolSecretKey: Joi.string().required(),
    username: Joi.string().min(3).max(12).required(),
    password: Joi.string().min(8).required(),
    password_again: Joi.ref("password"),
    currency: Joi.string(),
    isAdmin: Joi.bool(),
  });
  return schema.validate(admin);
}

function validateAdminRegistration(adminReg) {
  const schema = Joi.object({
    schoolSecretKey: Joi.string().required(),
    schoolName: Joi.string().max(15).required(),
    username: Joi.string().min(3).max(12).required(),
    gender: Joi.string().min(3).max(12).required(),
    password: Joi.string().min(8).required(),
    currency: Joi.string().required(),
    password_again: Joi.ref("password"),
    isAdmin: Joi.bool().required(),
  });
  return schema.validate(adminReg);
}

adminAuthSchema.methods.generateAdminAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      role: this.role,
      gender: this.gender,
      isAdmin: this.isAdmin,
      username: this.username,
      currency: this.currency,
      schoolName: this.schoolName,
      schoolSecretKey: this.schoolSecretKey,
    },
    config.get("private_key")
  );
  return token;
};

const AdminAuth = mongoose.model("admin", adminAuthSchema);

module.exports.ValidateAdminAuth = validateAdminAuth;
module.exports.ValidateAdminRegistration = validateAdminRegistration;
module.exports.AdminAuth = AdminAuth;
