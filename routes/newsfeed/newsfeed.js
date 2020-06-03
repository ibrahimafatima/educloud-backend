const express = require("express");
const mongoose = require("mongoose");
const isAuth = require("../../middleware/isAuth");
const { Newsfeed } = require("../../model/newsfeed/newsfeed");

const router = express.Router();

router.post("/", isAuth, async (req, res) => {
  const newPost = new Newsfeed({
    username: req.adminToken.username,
    role: req.adminToken.role,
    post_text: req.body.post_text,
    schoolName: req.adminToken.schoolName,
    schoolSecretKey: req.adminToken.schoolSecretKey,
  });
  const result = await newPost.save();
  res.send(result);
});

router.get("/first-news", async (req, res) => {
  const allPost = await Newsfeed.find().limit(2).sort("-post_date");
  if (!allPost) return res.status(404).send("No post was found!");
  res.send(allPost);
});

router.get("/middle-news", async (req, res) => {
  const midddlePost = await Newsfeed.find().skip(2).limit(1).sort("-post_date");
  if (!midddlePost) return res.status(404).send("No post was found!");
  res.send(midddlePost);
});

router.get("/all-news", async (req, res) => {
  const allPost = await Newsfeed.find().skip(3).sort("-post_date");
  if (!allPost) return res.status(404).send("No post was found!");
  res.send(allPost);
});

module.exports = router;
