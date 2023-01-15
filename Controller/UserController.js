const AppError = require("../ErrorHandler/AppError");
const catchAsync = require("../ErrorHandler/CatchAsync");
const User = require("../Model/UserModel");
const issueJwt = require("../Helpers/IssueTokens");
const crypto = require("crypto");

exports.signUp = catchAsync(async (request, response) => {
  if (request.file) request.body.profileImage = request.file.filename;
  console.log(request.body);
  const document = await User.create(request.body);

  const accessToken = issueJwt.issueAccessToken({ _id: document._id });
  const refreshToken = issueJwt.issueRefreshToken({ _id: document._id });
  response.cookie("auth", refreshToken);

  const verificationToken = document.generateRandomToken();
  const verificationLink = `localhost:5000/api/v1/users/verify/${verificationToken}`;

  document.save({ validateBeforeSave: false });

  response.status(200).json({
    message: "Account Created Successfully",
    document,
    verificationLink,
    accessToken,
  });
});

exports.login = catchAsync(async (request, response, next) => {
  const { email, password } = request.body;

  if (!email || !password)
    return next(new AppError("Please enter email and password"));
  const document = await User.findOne({ email });

  if (!document || !(await document.checkPassword(document.password, password)))
    return next(new AppError("Email or password incorrect"));

  const accessToken = issueJwt.issueAccessToken({ _id: document._id });
  const refreshToken = issueJwt.issueRefreshToken({ _id: document._id });
  response.cookie("auth", refreshToken);

  response.status(200).json({
    message: "Logged in successfully",
    accessToken,
  });
});

exports.getUserById = catchAsync(async (request, response, next) => {
  const document = await User.findById(request.params.id).select("-password");
  response.status(200).json({
    document,
  });
});

exports.changePassword = catchAsync(async (request, response, next) => {
  const { oldPassword, newPassword, confirmNewPassword } = request.body;
  if (!oldPassword || !newPassword || !confirmNewPassword)
    return next(new AppError("Please enter all the details", 500));

  const document = await User.findById(request.user._id);
  if (!(await document.checkPassword(document.password, oldPassword)))
    return next(new AppError("Wrong Password", 500));

  document.password = newPassword;
  document.confirmPassword = confirmNewPassword;

  await document.save();

  response.status(200).json({
    message: "Password changed successfully",
  });
});

exports.updateFields = catchAsync(async (request, response, next) => {
  let deleteOptions = ["password", "isVerified"];
  if (request.body.password || request.body.isVerified)
    deleteOptions.forEach((el) => delete request.body[el]);

  const document = await User.findByIdAndUpdate(request.user.id, request.body, {
    new: true,
    runValidators: true,
  });

  response.status(200).json({
    message: "Updated Successfully",
    document,
  });
});

exports.uploadProfile = catchAsync(async (request, response, next) => {
  if (!request.file) return next(new AppError("Empty Image"));
  await User.findByIdAndUpdate(request.user._id, {
    profileImage: request.file.filename,
  });

  response.status(200).json({
    message: "Profile Picture Uploaded",
  });
});

exports.verfiyAccount = catchAsync(async (request, response, next) => {
  const token = request.params.token;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const document = await User.findOne({
    accountVerificationToken: hashedToken,
    accountVerificationTokenExpires: { $gt: Date.now() },
  });
  if (!document)
    return next(new AppError("Invalid Link or link has already expired"));

  document.isVerified = true;
  document.accountVerificationTokenExpires = undefined;
  await document.save({ validateBeforeSave: false });

  response.status(200).json({
    message: "Account Verified ",
  });
});
