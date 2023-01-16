const AppError = require("./AppError");

function handleDuplicationError(error) {
  const duplicateValues = error.message.match(/"([^"]*)"/)[0];
  const message = `Account already exist with  : ${duplicateValues}`;
  return new AppError(message, 400);
}

function handleCastError(error) {
  const message = `Invalid ${error.path} : ${error.value}`;
  return new AppError(message, 400);
}

function handleValidationError(error) {
  const messages = Object.values(error.errors)
    .map((err) => err.message)
    .join(" , ");
  return new AppError(messages, 400);
}

function handleJwtExpirationError() {
  return new AppError("JWT Expired Please Renew New Token", 401);
}

function sendErrorProduction(error, response) {
  if (error.code === 11000) error = handleDuplicationError(error);
  if (error.name === "CastError") error = handleCastError(error);
  if (error.name === "ValidationError") error = handleValidationError(error);
  if (error.name === "TokenExpiredError") error = handleJwtExpirationError();
  if (error.isOperational) {
    response.status(error.statusCode).json({
      message: error.message,
      status: error.status,
    });
  } else {
    response.status(error.statusCode).json({
      message: "Something went very wrong",
    });
  }
}

function sendErrorDevelopment(error, response) {
  response.status(error.statusCode).json({
    message: error.message,
    stack: error.stack,
    error,
  });
}

module.exports = (error, request, response, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "Error";
  if (process.env.NODE_ENV === "production")
    return sendErrorProduction(error, response);
  if (process.env.NODE_ENV === "development") {
    sendErrorDevelopment(error, response);
  }
};
