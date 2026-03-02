import LifeStatusRecordModel from "../../models/LifeStatusRecord.model.js";
import { uploadToCloudinary } from "../../services/cloudinary.service.js";
import UserModel from "../../models/User.model.js";
export const submitLifeStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if (!user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is not verified! please verify email first",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Selfie image is required!",
      });
    }

    const existingPending = await LifeStatusRecordModel.findOne({
      user: userId,
      verificationStatus: "PENDING",
    });

    if (existingPending) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending verification request",
      });
    }

    if(user.status === "DECEASED"){
        return res.status(403).json({
            success:false,
            message:"Deceased users cannot submit verification"
        })
    }

   const uploadResult = await uploadToCloudinary(
  req.file,
  `lifeauth/life-status-records/${userId}`
);
    const record = await LifeStatusRecordModel.create({
      user: userId,
      selfieImage: uploadResult.secure_url,
      verificationStatus: "PENDING",
    });

    return res.status(201).json({
      success: true,
      message: "Life status submitted successfully. Awaiting admin review",
      data: record,
    });
  } catch (err) {
    console.log("SUBMIT LIFE STATUS API ERROR : ", err);
    res.status(500).json({
      success: false,
      message: "Failed to submit life status!",
    });
  }
};
