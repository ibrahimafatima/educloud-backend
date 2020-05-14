const express = require("express");
const mongoose = require("mongoose");
const { notify } = require("../pusher/notify");
const isAuth = require("../../middleware/isAuth");
const { Discussion } = require("../../model/students/discussion");

const router = express.Router();

router.post("/teacher/:id", isAuth, async (req, res) => {
  const payload = {
    message: req.body.message.trim(),
    sender: req.adminToken.username,
    classe:
      req.adminToken.role === "Teacher"
        ? req.params.id
        : req.adminToken.class_name,
    schoolName: req.adminToken.schoolName,
    schoolSecretKey: req.adminToken.schoolSecretKey,
    timestamp: new mongoose.Types.ObjectId().getTimestamp(),
  };
  notify(payload, "discussion");
  const discussion = new Discussion(payload);
  const result = await discussion.save();
  res.send(result);
});

router.get("/teacher/:id", isAuth, async (req, res) => {
  const discussion_data = await Discussion.find({
    classe:
      req.adminToken.role === "Teacher"
        ? req.params.id
        : req.adminToken.class_name,
    schoolSecretKey: req.adminToken.schoolSecretKey,
  })
    .sort("date")
    .select(["-_id", "-date", "-__v"]);
  if (!discussion_data)
    return res.status(400).send("Error while getting chat data...");
  res.send(discussion_data);
});

module.exports = router;
