const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);
const Joi = require("@hapi/joi");

const classesSchema = new mongoose.Schema({
  className: {
    type: String,
    unique: true,
    required: true
  },
  classe: {
    type: String,
    maxlength: 12,
    required: true
  },
  amount_to_pay: {
    type: Number,
    required: true
  },
  level: {
    type: String,
    required: true
  },
  addedBy: {
    type: String,
    required: true
  },
  lastUpdatedBy: {
    type: String
  },
  schoolSecretKey: {
    type: String,
    required: true
  },
  isInCharge: { type: Boolean }
});

const AddClass = mongoose.model("classes", classesSchema);

function validateClasses(classes) {
  const schema = Joi.object({
    className: Joi.string()
      .min(3)
      .max(12)
      .required()
      .uppercase(),
    level: Joi.string()
      .required()
      .uppercase(),
    classe: Joi.string()
      .max(12)
      .required(),
    isInCharge: Joi.bool().required(),
    amount_to_pay: Joi.number().required()
  });
  return schema.validate(classes);
}

module.exports.ValidateClasses = validateClasses;
module.exports.AddClass = AddClass;
