import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.model.js";
import { config } from "../configs/env.config.js";

await mongoose.connect(config.MONGO_URI);

const existing = await User.findOne({ email: "admin@lifeauth.com" });

if (!existing) {
  const hashedPassword = await bcrypt.hash("admin1234", 10);

  await User.create({
    firstName: "system",
    middleName: "super",
    lastName: "admin",
    phoneNumber: "9999999999",
    email: "admin@lifeauth.com",
    password: hashedPassword,
    role: "ADMIN",
    status: "ACTIVE",
    isEmailVerified: true
  });

  console.log("Admin created successfully");
} else {
  console.log("Admin already exists");
}

process.exit();