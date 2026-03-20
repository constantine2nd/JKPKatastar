import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/userModel.js";
import { MAINTAINER } from "../utils/constant.js";

dotenv.config();

const { MONGO_URI, MAINTAINER_NAME, MAINTAINER_EMAIL, MAINTAINER_PASSWORD } = process.env;

if (!MAINTAINER_NAME || !MAINTAINER_EMAIL || !MAINTAINER_PASSWORD) {
  console.error("Missing MAINTAINER_NAME, MAINTAINER_EMAIL or MAINTAINER_PASSWORD env vars.");
  process.exit(1);
}

await mongoose.connect(MONGO_URI);

const existing = await User.findOne({ email: MAINTAINER_EMAIL });

if (existing) {
  console.log(`Maintainer user already exists (${MAINTAINER_EMAIL}), skipping.`);
} else {
  await User.create({
    name: MAINTAINER_NAME,
    email: MAINTAINER_EMAIL,
    password: MAINTAINER_PASSWORD,
    role: MAINTAINER,
    isActive: true,
    isVerified: true,
  });
  console.log(`Maintainer user created: ${MAINTAINER_EMAIL}`);
}

await mongoose.disconnect();
