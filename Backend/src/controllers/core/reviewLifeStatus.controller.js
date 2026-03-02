import LifeStatusRecordModel from "../../models/LifeStatusRecord.model.js";
import UserModel from "../../models/User.model.js";
import redisClient from "../../redis/redisClient.js";

export const reviewLifeStatus = async (req, res) => {
  try {
    const { recordId } = req.params;
    const adminId = req.user.id;
    const { remark, action } = req.body;
    const record = await LifeStatusRecordModel.findById(recordId);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Record not found",
      });
    }

    if (record.verificationStatus !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "Record already reviewed!",
      });
    }
    const associatedUser = await UserModel.findById(record.user);

    if (!associatedUser) {
      return res.status(404).json({
        success: false,
        message: "Record not found for this user",
      });
    }

    const now = new Date();
    const expiryDate = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);

    if (action === "APPROVE") {
      record.verificationStatus = "VERIFIED";

      record.verificationDate = now;
      record.verificationExpiresAt = expiryDate;
      record.reviewedBy = adminId;
      record.reviewDate = now;
      record.remark = remark;

      await record.save();

      associatedUser.lastVerificationDate = now;
      associatedUser.verificationExpiresAt = expiryDate;
      associatedUser.status = "ACTIVE";

      await associatedUser.save();
    } else if (action === "REJECT") {
      if (!remark) {
        return res.status(400).json({
          success: false,
          message: "Remark is required for rejection",
        });
      }
      record.verificationStatus = "REJECTED";
      record.reviewedBy = adminId;
      record.reviewDate = now;
      record.remark = remark;

      await record.save();
    } else {
     return res.status(400).json({
        success:false,
        message:"Invalid Action!"
     })
    }

    await redisClient.del("record:pending");
    return res.status(200).json({
      success: true,
      message: "Status updated successfully",
    });
  } catch (err) {
    console.log("GET LIFE STATUS RECORD BY ID ERROR : ", err);
    res.status(500).json({
      success: false,
      message: "Failed to update status",
    });
  }
};
