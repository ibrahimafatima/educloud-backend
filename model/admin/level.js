const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);
const Joi = require("@hapi/joi");

const levelSchema = new mongoose.Schema({
  level: {
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

const level = mongoose.model("level", levelSchema);

function validateLevel(level) {
  const schema = Joi.object({
    level: Joi.string().max(50).required(),
  });
  return schema.validate(level);
}

module.exports.validateLevel = validateLevel;
module.exports.level = level;
