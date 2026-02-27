import userModel from "../../models/User.model.js";
import jwt from "jsonwebtoken";
import {config} from "../../configs/env.config.js"
import mongoose from "mongoose"
import {sendUserVerificationEmail,sendNomineeSetupEmail} from "../../services/mail.service.js"
const generateToken = (payload, expiresIn = "1h") => {
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn });
};


export const register = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { firstName, middleName, lastName, phoneNumber, email, password, nominee } = req.body;

    const existingUser = await userModel.findOne({ email }).session(session);

    if (existingUser) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "User with this email already exists"
      });
    }

    const newUserArr = await userModel.create([{
      firstName,
      middleName,
      lastName,
      phoneNumber,
      email,
      password,
      role: "USER",
      status: "ACTIVE",
      isEmailVerified: false
    }], { session });

    const newUser = newUserArr[0];

    let nomineeUser = await userModel.findOne({ email: nominee.email }).session(session);

    if (nomineeUser) {
      if (nomineeUser.role !== "NOMINEE") {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: "Nominee email already registered as normal user"
        });
      }

      nomineeUser.linkedUser = newUser._id;
      nomineeUser.relation = nominee.relation;
      await nomineeUser.save({ session });

    } else {
      const nomineeArr = await userModel.create([{
        firstName: nominee.firstName,
        middleName: nominee.middleName || "",
        lastName: nominee.lastName,
        phoneNumber: nominee.phoneNumber || "0000000000",
        email: nominee.email,
        role: "NOMINEE",
        linkedUser: newUser._id,
        relation: nominee.relation,
        isEmailVerified: false
      }], { session });

      nomineeUser = nomineeArr[0];
    }

    await session.commitTransaction();
    session.endSession();

    // 🔥 Send email AFTER commit
    const userVerifyToken = generateToken({ id: newUser._id, role: "USER" });
    const nomineeSetupToken = generateToken({ id: nomineeUser._id, role: "NOMINEE" });

    try {
      await sendUserVerificationEmail(newUser.email, userVerifyToken);
      await sendNomineeSetupEmail(nomineeUser.email, nomineeSetupToken);
    } catch (mailError) {
      console.error("Email failed:", mailError.message);
    }

    return res.status(201).json({
      success: true,
      message: "Registration successful. Verification required."
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("REGISTER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Registration failed"
    });
  }
};