const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);
const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);

const librarySchema = new mongoose.Schema({
  bookTitle: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  totalQty: {
    type: Number,
  },
  updatedOn: {
    type: Date,
    default: new Date(),
  },
  addedBy: {
    type: String,
    required: true,
  },
  schoolSecretKey: {
    type: String,
    required: true,
  },
});

const Library = mongoose.model("library", librarySchema);

function validateLibrary(library) {
  const schema = Joi.object({
    bookTitle: Joi.string().max(20).required(),
    author: Joi.string().max(20).required(),
    totalQty: Joi.number().min(0),
    availableQty: Joi.number().min(0),
  });
  return schema.validate(library);
}

module.exports.Library = Library;
module.exports.ValidateLibrary = validateLibrary;
