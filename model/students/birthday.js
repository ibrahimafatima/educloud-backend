const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);
const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);

const birthdaySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  className: {
    type: String,
    required: true,
  },
  birthdayDate: {
    type: Date,
    required: true,
  },
});

const birthday = new mongoose.model("birthday", birthdaySchema);

function validateBirthday(birthday) {
  const schema = Joi.object({
    name: Joi.string().required(),
    className: Joi.string().required(),
    birthdayDate: Joi.string().required(),
  });
  return schema.validate(birthday);
}

module.exports.Birthday = birthday;
module.exports.ValidateBirthday = validateBirthday;
