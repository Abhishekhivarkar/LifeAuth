import UserModel from "../../models/User.model.js"
import crypto from "crypto"
import {config} from "../../configs/env.config.js"
import { sendResetPasswordMail } from "../../services/mail.service.js"

export const forgotPassword =async (req,res) =>{
 try{
  const {email} = req.body
  const user =await UserModel.findOne({email})
  
  if(!user){
   return res.status(404).json({
    success:false,
    message:"Email not found"
   })
  }
  
  if(user.isEmailVerified === false){
    return res.status(400).json({
        succcess:false,
        message:"Email is not verified please verify email first!"
    })
  }
  const resetToken = crypto.randomBytes(32).toString("hex")
  
  user.resetPasswordToken = crypto
  .createHash("sha256")
  .update(resetToken)
  .digest("hex")
  
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000 

  await user.save({validateBeforeSave:false})
  const resetPasswordUrl = `${config.CLIENT_URL}/reset-password/${resetToken}`
  await sendResetPasswordMail(email,resetPasswordUrl,user.firstName,user.lastName)
  
 return res.status(200).json({
  success:true,
  message:"Reset password mail send successfully!"
 })
 }catch(err){
  console.log("FORGOT PASSWORD API ERROR :", err)
  res.status(500).json({
    success:false,
    message:"Failed to send forgot password mail"
  })
 }
}