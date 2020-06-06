const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);

const likeSchema = new mongoose.Schema({
  postId: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
});

const like = mongoose.model("likes", likeSchema);

module.exports.Like = like;
