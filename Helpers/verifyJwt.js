const jwt = require("jsonwebtoken");
const AppError = require("../ErrorHandler/AppError");
const CatchAsync = require("../ErrorHandler/CatchAsync");
const User = require("../Model/UserModel");

module.exports = CatchAsync(async (request, response, next) => {
  let token;
  if (
    request.headers.authorization &&
    request.headers.authorization.startsWith("Bearer")
  )
    token = request.headers.authorization.split(" ")[1];

  if (!token) return next(new AppError("Please provide token"));

  const decode = jwt.decode(token);

  const document = await User.findById(decode._id);

  if (!document) return next(new AppError("User no longer exist"));

  console.log(document.hasChangedPasswordRecently());

  if (document.hasChangedPasswordRecently(decode.iat))
    return next(new AppError("User has changed password recently"));

  request.user = document;

  next();
});
