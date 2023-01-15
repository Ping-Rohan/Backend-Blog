const express = require("express");
const Router = express.Router();
const PostController = require("../Controller/PostController");
const VerifyJwt = require("../Helpers/verifyJwt");
const CommentRoute = require("./CommentRoute");
const upload = require("../Helpers/Multer.js");

Router.use(VerifyJwt);
Router.use("/:id/comment", CommentRoute);
Router.route("/").post(upload.array("photos", 3), PostController.post);
Router.route("/:id")
  .get(PostController.getPostById)
  .put(PostController.updatePost)
  .delete(PostController.deletePost);
Router.route("/:id/like").post(PostController.like);

module.exports = Router;
