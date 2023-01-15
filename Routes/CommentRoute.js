const express = require("express");
const Router = express.Router({ mergeParams: true });
const verifyJwt = require("../Helpers/verifyJwt.js");
const commentController = require("../Controller/CommentController");

Router.use(verifyJwt);
Router.route("/").post(commentController.createComment);

module.exports = Router;
