const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");
const crypto = require("crypto");

const UserSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    validate: [validator.isEmail, "Please enter valid email"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please enter password"],
    validate: [
      validator.isStrongPassword,
      "Please Enter Strong Password Including Uppercase , Lowercase , Number , Symbols and Length Of 8 Character",
    ],
  },
  confirmPassword: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      validator: function (value) {
        return this.password === value;
      },
      message: "Password doesnot match",
    },
  },
  profileImage: {
    type: String,
    required: [true, "Upload Your Profile Picture"],
    default:
      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png",
  },
  role: {
    type: String,
    enum: ["Reader", "Poster"],
    required: [true, "Please specify your role"],
    default: "Reader",
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  following: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  coverImage: {
    type: String,
  },
  accountVerificationToken: String,
  accountVerificationTokenExpires: Date,
  passwordResetToken: String,
  passwordChangedAt: Date,
  resetTokenExpires: Date,
});

// password hashing
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  this.confirmPassword = undefined;
  next();
});

UserSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now();
  next();
});

UserSchema.pre(/^find/, function (next) {
  this.select("name profileImage role email isVerified");
  next();
});

// methods for user instance
UserSchema.methods.checkPassword = async (documentPassword, password) => {
  return await bcrypt.compare(password, documentPassword);
};

UserSchema.methods.hasChangedPasswordRecently = function (jwtIssued) {
  if (this.passwordChangedAt) {
    const passwordChangedTime = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return jwtIssued < passwordChangedTime;
  }
  return false;
};

UserSchema.methods.generateRandomToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  this.accountVerificationToken = hashedToken;
  this.accountVerificationTokenExpires = Date.now() + 10 * 60 * 1000;
  return token;
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
