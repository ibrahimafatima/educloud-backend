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

const school_classe = mongoose.model("school_classe", schoolClassSchema);

function validateSchoolClasse(school_classe) {
  const schema = Joi.object({
    classe: Joi.string().max(25).required(),
  });
  return schema.validate(school_classe);
}

module.exports.validateSchoolClasse = validateSchoolClasse;
module.exports.school_classe = school_classe;
