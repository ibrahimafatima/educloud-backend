const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);

function validateObjectId(value) {
  const schema = Joi.object({
    id: Joi.objectId().required()
  });
  return schema.validate(value);
}

module.exports.ValidateObjectId = validateObjectId;
