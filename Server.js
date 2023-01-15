const app = require("./App");
require("dotenv").config();
const mongoose = require("mongoose");

process.on("uncaughtException", (error) => {
  server.close(() => {
    process.exit(1);
  });
});

mongoose.set("strictQuery", true);

mongoose
  .connect(
    `${process.env.DB_LINK}`.replace("<PASSWORD>", process.env.DB_PASSWORD)
  )
  .then(() => {
    console.log("Database Connected Successfully");
  });

const server = app.listen(process.env.PORT || 5000, () => {
  console.log("Server Started on port ", process.env.PORT);
});

process.on("unhandledRejection", (error) => {
  server.close(() => {
    process.exit(1);
  });
});
