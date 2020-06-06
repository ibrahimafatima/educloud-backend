const express = require("express");
const mongoose = require("mongoose");
const isAuth = require("../../middleware/isAuth");
const { Like } = require("../../model/newsfeed/like");

const router = express.Router();

router.post("/post/:id", isAuth, async (req, res) => {
  const post = await Like.findOne({
    $and: [{ postId: req.params.id }, { username: req.adminToken.username }],
  });
  if (post) {
    const result = await post.remove();
    res.send(result);
    return;
  }
  const newLike = new Like({
    postId: req.params.id,
    username: req.adminToken.username,
  });
  const result = await newLike.save();
  res.send(result);
});

router.get("/post/:id", async (req, res) => {
  const post = await Like.find({
    postId: req.params.id,
  });
  if (!post) return res.status(404).send("Post not found");
  res.send(post);
});

router.get("/liked-post/:id", isAuth, async (req, res) => {
  const post = await Like.find({
    postId: req.params.id,
    username: req.adminToken.username,
  });
  if (!post) return res.status(404).send("Post not found");
  res.send(post);
});

module.exports = router;
