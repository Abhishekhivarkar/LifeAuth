import crypto from "crypto"
import UserModel from "../../models/User.model.js"

export const resetPassword =async (req,res)=>{
    try{
        const {token} = req.params
        const {newPassword,confirmPassword} = req.body

        if(!newPassword || !confirmPassword){
            return res.status(401).json({
                success:false,
                message:"New password and Confirm password fields are required!"
            })
        }

        if(newPassword !== confirmPassword){
            return res.status(401).json({
                success:false,
                message:"Password do not match!"
            })
        }

        const hashToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex")

        const user = await UserModel.findOne({
            resetPasswordToken:hashToken,
            resetPasswordExpire:{$gt:Date.now()}
        })

        if(!user){
            return res.status(404).json({
                success:false,
                message:"Reset password token is invalid or expired!"
            })
        }

      
        user.password = confirmPassword
        user.resetPasswordExpire = null
        user.resetPasswordToken = null

        await user.save()

        return res.status(200).json({
            success:true,
            message:"Password reset successfully"
        })
    }catch(err){
        console.log("RESET PASSWORD API ERROR : ", err)
        res.status(500).json({
            success:false,
            message:"Failed to reset password"
        })
    }
}