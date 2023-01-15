const multer = require("multer");
const AppError = require("../ErrorHandler/AppError");

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "Public/Users");
  },
  filename: (req, file, cb) => {
    let ext = file.mimetype.split("/")[1];
    cb(null, `${Date.now()}.${ext}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Only photo is supported", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

module.exports = upload;
