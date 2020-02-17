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
  username: {
    type: String,
    minlength: 3,
    maxlength: 12,
    unique: true,
    required: true
  },
  password: {
    type: String,
    minlength: 8,
    required: true
  },
  isAdmin: { type: Boolean }
});

function validateAdminAuth(admin) {
  const schema = Joi.object({
    schoolSecretKey: Joi.string().required(),
    username: Joi.string()
      .min(3)
      .max(12)
      .required(),
    password: Joi.string()
      .min(8)
      .required(),
    password_again: Joi.ref("password"),
    isAdmin: Joi.bool()
  });
  return schema.validate(admin);
}

adminAuthSchema.methods.generateAdminAuthToken = function() {
  const token = jwt.sign(
    { _id: this._id, isAdmin: this.isAdmin, username: this.username },
    config.get("private_key")
  );
  return token;
};

const AdminAuth = mongoose.model("admin", adminAuthSchema);

module.exports.validateAdminAuth = validateAdminAuth;
module.exports.AdminAuth = AdminAuth;
