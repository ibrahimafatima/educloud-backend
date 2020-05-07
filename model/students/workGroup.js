const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);
const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);

const workGroupSchema = new mongoose.Schema({
  groupName: {
    type: String,
    required: true
  },
  groupID: {
    type: String,
    required: true
  },
  createdOn: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: String,
    required: true
  }
});

const workGroup = mongoose.model("work_groups", workGroupSchema);

function validateWorkGroup(group) {
  const schema = Joi.object({
    groupName: Joi.string()
      .min(3)
      .max(18)
      .required()
  });
  return schema.validate(group);
}

module.exports.WorkGroup = workGroup;
module.exports.ValidateWorkGroup = validateWorkGroup;
