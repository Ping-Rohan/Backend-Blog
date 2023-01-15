const mongoose = require("mongoose");
const { post } = require("../Controller/PostController");

const PostSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Post title cannot be empty"],
    },
    description: {
      type: String,
      required: [true, "Post description is required"],
    },
    photos: {
      type: [String],
    },
    author: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    likes: {
      type: [mongoose.Schema.ObjectId],
      ref: "User",
    },
  },
  {
    toJSON: { virtuals: true },
    toOBJECT: { virtuals: true },
  }
);

PostSchema.virtual("comment", {
  ref: "Comment",
  foreignField: "post",
  localField: "_id",
});

PostSchema.pre(/^find/, function (next) {
  this.populate({
    path: "comment author",
    select: "-passwordChangedAt -isVerified -password",
  });
  next();
});

const Post = mongoose.model("Post", PostSchema);

module.exports = Post;
