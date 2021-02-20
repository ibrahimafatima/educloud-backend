const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);
const Joi = require("@hapi/joi");

const schoolClassSchema = new mongoose.Schema({
  classe: {
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
});

const schoolClasses = mongoose.model("school_classes", schoolClassSchema);

function validateSchoolClasse(schoolClasses) {
  const schema = Joi.object({
    classe: Joi.string().max(25).required(),
  });
  return schema.validate(schoolClasses);
}

module.exports.validateSchoolClasse = validateSchoolClasse;
module.exports.SchoolClasses = schoolClasses;
