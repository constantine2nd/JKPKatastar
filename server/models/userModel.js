import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { pseudoRandomToken } from "../utils/pseudoRandomGenerator.js";
import { VISITOR } from "../utils/constant.js";

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    default: VISITOR,
  },
  avatarUrl: {
    type: String,
    required: false,
    default: "",
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true,
  },
  isVerified: {
    type: Boolean,
    required: true,
    default: false,
  },
  pseudoRandomToken: {
    type: String,
    required: true,
    default: pseudoRandomToken(128),
  },
  pseudoRandomTokenTillDate: {
    type: Date,
    required: true,
    default: Date.now(),
  },
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
userSchema.pre("save", async function (next) {
  const user = this;

  if (!user.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password, salt);
    user.password = hashedPassword;
    next();
  } catch (error) {
    return next(error);
  }
});

const User = mongoose.model("User", userSchema);

export default User;
