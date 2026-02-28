import LifeStatusRecordModel from "../../models/LifeStatusRecord.model";
import UserModel from "../../models/User.model";

export const getLifeStatusRecordById = async (req,res) =>{
    try{
        const {recordId} = req.params
        const adminId = req.user.id
        const {remark} = req.body
        const record = await LifeStatusRecordModel.findById(recordId)
        
        if(!record){
            return res.status(404).json({
                success:false,
                message:"Record not found"
            })
        }

        if (record.verificationStatus !== "PENDING"){
            return res.status(400).json({
                success:false,
                message:"Record already reviewed!"
            })
        }
       const associatedUser = await UserModel.findById(record.user)

       if (!associatedUser){
        return res.status(404).json({
            success:false,
            message:"Record not found for this user"
        })
       }
       
       const now = Date.now()
       const expiryDate = new Date(now.getTime() + (180 * 24 * 60 * 60 * 1000))

       record.verificationStatus = "VERIFIED"
       record.verificationDate = now
       record.verificationExpiresAt = expiryDate
       record.reviewedBy = adminId
       record.reviewDate = now
       record.remark = remark

       await record.save()

       associatedUser.lastVerificationDate = now
       associatedUser.verificationExpiresAt = expiryDate
       associatedUser.status = "ACTIVE"

       await associatedUser.save()

       return res.status(200).json({
        success:true,
        message:"Status updated successfully"
       })
    }catch(err){
        console.log("GET LIFE STATUS RECORD BY ID ERROR : ",err)
        res.status(500).json({
            success:false,
            message:"Failed to update status"
        })
    }
}