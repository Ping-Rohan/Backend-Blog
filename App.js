const express = require("express");
const app = express();
const cors = require("cors");
const UserRouter = require("./Routes/UserRoute");
const PostRouter = require("./Routes/PostRoute");
const globalErrorHandler = require("./ErrorHandler/GlobalError");
const AppError = require("./ErrorHandler/AppError");
const cookieParser = require("cookie-parser");

const corsOpts = {
  origin: "*",

  methods: ["GET", "POST"],

  allowedHeaders: ["Content-Type"],
};

// middlewares
app.use(cors(corsOpts));
app.use(express.json());
app.use(cookieParser());

// redirecting routes
app.use("/api/v1/users", UserRouter);
app.use("/api/v1/post", PostRouter);
app.use("/", express.static("./Public/Users"));

app.all("*", (request, response, next) => {
  return next(new AppError("Couldnot Found Route On This Server", 404));
});

// global error handler
app.use(globalErrorHandler);

module.exports = app;
