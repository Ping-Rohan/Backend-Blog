const express = require("express");
const Router = express.Router();
const UserController = require("../Controller/UserController");
const verifyJwt = require("../Helpers/verifyJwt");
const upload = require("../Helpers/Multer");
const { refreshAccessToken } = require("../Helpers/IssueTokens");

// user sub routes for /api/v1/users
Router.route("/signup").post(
  upload.single("profilePicture"),
  UserController.signUp
);
Router.route("/verify/:token").post(UserController.verfiyAccount);
Router.route("/refresh").get(refreshAccessToken);
Router.route("/login").post(UserController.login);
Router.route("/:id").get(UserController.getUserById);

// protected routes
Router.use(verifyJwt);
Router.route("/change-password").patch(UserController.changePassword);
Router.route("/update").patch(UserController.updateFields);
Router.route("/profile-picture").post(
  upload.single("profile"),
  UserController.uploadProfile
);

module.exports = Router;
