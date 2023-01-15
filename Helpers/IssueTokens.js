const jwt = require("jsonwebtoken");
const AppError = require("../ErrorHandler/AppError");
const CatchAsync = require("../ErrorHandler/CatchAsync");
const User = require("../Model/UserModel");

const issueAccessToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_SECRET, {
    expiresIn: "600000",
  });
};

const issueRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_SECRET, {
    expiresIn: "1d",
  });
};

const refreshAccessToken = CatchAsync(async (request, response, next) => {
  let refreshToken;
  if (request.cookies.auth) refreshToken = request.cookies.auth;

  if (!refreshToken)
    return next(new AppError("Please provide token to refresh access token"));

  const decode = jwt.decode(refreshToken);
  const document = await User.findById(decode._id);

  if (!document) return next(new AppError("User no longer exist"));

  const newRefreshToken = issueRefreshToken({ _id: document._id });
  response.clearCookie("auth");
  response.cookie("auth", newRefreshToken);

  response.status(200).json({
    accessToken: issueAccessToken({ _id: document._id }),
  });
});

module.exports = { issueAccessToken, issueRefreshToken, refreshAccessToken };
