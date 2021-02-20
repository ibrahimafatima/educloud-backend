const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);
const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  homeworkURL: {
    type: String,
    required: true
  },
  className: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  postedOn: {
    type: Date,
    default: Date.now,
  },
  postedBy: {
    type: String,
    required: true,
  },
  registrationID: {
    type: String,
    required: true,
  },
  toBeSubmittedOn: {
    type: Date,
    required: true,
  },
  schoolSecretKey: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: "New",
  },
});

const assignment = new mongoose.model("assignment", assignmentSchema);

function validateAssignment(assign) {
  const schema = Joi.object({
    title: Joi.string().min(3).max(18).required(),
    homeworkURL: Joi.string().required(),
    name: Joi.string().required(),
    className: Joi.string().required(),
    toBeSubmittedOn: Joi.string().required(),
  });
  return schema.validate(assign);
}

module.exports.Assignment = assignment;
module.exports.ValidateAssignment = validateAssignment;
