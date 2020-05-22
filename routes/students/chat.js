const express = require("express");
const mongoose = require("mongoose");
const { notify } = require("../pusher/notify");
const isAuth = require("../../middleware/isAuth");
const { Chat } = require("../../model/students/chat");

const router = express.Router();

router.post("/", isAuth, async (req, res) => {
  if (req.body.message.trim() === "") return;
  const payload = {
    message: req.body.message.trim(),
    sender: req.adminToken.username,
    classe: req.adminToken.class_name,
    schoolName: req.adminToken.schoolName,
    schoolSecretKey: req.adminToken.schoolSecretKey,
    timestamp: new mongoose.Types.ObjectId().getTimestamp(),
  };
  notify(payload, "message");
  const save_chat = new Chat(payload);
  const result = await save_chat.save();
  res.send(result);
});

router.get("/", isAuth, async (req, res) => {
  const chat_data = await Chat.find({
    classe: req.adminToken.class_name,
    schoolSecretKey: req.adminToken.schoolSecretKey,
  })
    .sort("date")
    .select(["-_id", "-date", "-__v"]);
  if (!chat_data)
    return res.status(400).send("Error while getting chat data...");
  res.send(chat_data);
});

module.exports = router;
