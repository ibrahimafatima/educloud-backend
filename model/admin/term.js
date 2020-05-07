const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);
const Joi = require("@hapi/joi");

const termSchema = new mongoose.Schema({
  term: {
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

const terms = mongoose.model("terms", termSchema);

function validateTerm(school_term) {
  const schema = Joi.object({
    term: Joi.string().max(25).required(),
  });
  return schema.validate(school_term);
}

module.exports.validateTerm = validateTerm;
module.exports.Terms = terms;
