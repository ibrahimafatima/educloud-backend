const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);
const config = require("config");
const jwt = require("jsonwebtoken");
const Joi = require("@hapi/joi");

const adminAuthSchema = new mongoose.Schema({
  schoolSecretKey: {
    type: String,
    required: true
  },
  schoolName: {
    type: String,
    required: true
  },
  username: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    required: true
  },
  profileURL: {
    type: String,
    default: "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
  },
  country: {
    type: String,
    required: true
  },
  currency: {
    type: String,
    required: true
  },
  pack: {
    type: String,
    required: true
  },
  isAdmin: { type: Boolean },
});

function validateLoginAuth(admin) {
  const schema = Joi.object({
    username: Joi.string().min(3).max(15).required(),
    password: Joi.string().min(8).max(20).required()
  });
  return schema.validate(admin);
}

function validateRegistrationAuth(admin) {
  const schema = Joi.object({
    registrationID: Joi.string().required(),
    username: Joi.string().min(3).max(15).required(),
    password: Joi.string().min(8).max(20).required(),
    password_again: Joi.ref("password"),
  });
  return schema.validate(admin);
}


function validateAdminRegistration(adminReg) {
  const schema = Joi.object({
    schoolSecretKey: Joi.string().required(),
    schoolName: Joi.string().min(3).max(30).required(),
    username: Joi.string().min(3).max(15).required(),
    gender: Joi.string().min(3).max(15).required(),
    password: Joi.string().min(8).max(20).required(),
    currency: Joi.string().required(),
    country: Joi.string().required(),
    pack: Joi.string().required(),
    password_again: Joi.ref("password"),
    isAdmin: Joi.bool().required(),
  });
  return schema.validate(adminReg);
}

adminAuthSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      role: this.role,
      pack: this.pack,
      gender: this.gender,
      isAdmin: this.isAdmin,
      country: this.country,
      username: this.username,
      currency: this.currency,
      schoolName: this.schoolName,
      profileURL: this.profileURL,
      schoolSecretKey: this.schoolSecretKey,
    },
    config.get("private_key")
  );
  return token;
};

const AdminAuth = mongoose.model("admin", adminAuthSchema);

module.exports.validateLoginAuth = validateLoginAuth;
module.exports.validateRegistrationAuth = validateRegistrationAuth;
module.exports.validateAdminRegistration = validateAdminRegistration;
module.exports.AdminAuth = AdminAuth;
