const express = require("express");
const mongoose = require("mongoose");
const isAuth = require("../../middleware/isAuth");
const { Comment } = require("../../model/newsfeed/comment");

const router = express.Router();

router.post("/", isAuth, async (req, res) => {
  const postedComment = await Comment.find({
    id: req.body.id,
  });
  if (postedComment.length >= 3)
    return res.status(400).send("Comment limit reached");
  const newComment = new Comment({
    id: req.body.id,
    username: req.adminToken.username,
    commentText: req.body.commentText,
    gender: req.adminToken.gender,
  });
  const result = await newComment.save();
  res.send(result);
});

router.get("/all-comment/:id", async (req, res) => {
  const comment = await Comment.find({
    id: req.params.id,
  });
  if (!comment) return res.status(404).send("No comment available");
  res.send(comment);
});

module.exports = router;
