const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);
const Joi = require("@hapi/joi");

const classSchema = new mongoose.Schema({
  className: {
    type: String,
    required: true,
  },
  classe: {
    type: String,
    required: true,
  },
  amountToPay: {
    type: Number,
    required: true,
  },
  level: {
    type: String,
    required: true,
  },
  addedBy: {
    type: String,
    required: true,
  },
  lastUpdatedBy: {
    type: String,
  },
  schoolSecretKey: {
    type: String,
    required: true,
  },
  isInCharge: { type: Boolean },
});

function validateClasses(classes) {
  const schema = Joi.object({
    className: Joi.string().min(3).max(12).required().uppercase(),
    level: Joi.string().required().uppercase(),
    classe: Joi.string().max(12).required(),
    isInCharge: Joi.bool(),
    amountToPay: Joi.number().required(),
  });
  return schema.validate(classes);
}

const ClassesDetails = mongoose.model("classes", classSchema);

module.exports.ValidateClasses = validateClasses;
module.exports.ClassesDetails = ClassesDetails;
