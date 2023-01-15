const mongoose = require("mongoose");

const CommentSchema = mongoose.Schema({
  comment: {
    type: String,
    required: [true, "Comment Cant Be Empty"],
  },
  commentedBy: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  post: {
    type: mongoose.Schema.ObjectId,
    ref: "Post",
    required: [true],
  },
  commentedOn: {
    type: Date,
    required: true,
  },
});

const Comment = mongoose.model("Comment", CommentSchema);

module.exports = Comment;
