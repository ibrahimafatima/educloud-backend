const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);
const Joi = require("@hapi/joi");

const chatSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  sender: {
    type: String,
    required: true,
  },
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
  date: {
    type: Date,
    default: Date.now,
  },
  timestamp: {
    type: String,
  },
});

function validateChat(chat) {
  const schema = Joi.object({
    message: Joi.string().required(),
  });
  return schema.validate(chat);
}

const chat = mongoose.model("chats", chatSchema);

module.exports.Chat = chat;
module.exports.validateChat = validateChat;
