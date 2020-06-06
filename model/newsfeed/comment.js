const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);

const commentSchema = new mongoose.Schema({
  id: {
    type: String,
  },
  commentText: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    default: "male",
  },
  commentedOn: {
    type: Date,
    default: new Date(),
  },
});

const comment = mongoose.model("comments", commentSchema);

module.exports.Comment = comment;
