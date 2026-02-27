import UserModel from "../../models/User.model.js"
import crypto from "crypto"
import {config} from "../../configs/env.config.js"
export const forgotPassword =async (req,res) =>{
 try{
  const {email} = req.body
  const user = UserModel.findOne({email})
  
  if(!user){
   return res.status(404).json({
    success:false,
    message:"Email not found"
   })
  }
  
  const resetToken = await crypto.randomBytes(32).toString("hex")
  
  UserModel.resetPasswordToken = crypto
  .createHash("sha256")
  .update(resetToken)
  .digest("hex")
  
  UserModel.resetPasswordExpire = Date.now() + 15 * 60 * 1000 
  resetPasswordUrl = `${config.CLIENT_URL}/reset-password`
  await sendResetPasswordMail(resetPasswordUrl,user.firstName,user.lastName)
  
 return res.status(200).json({
  
 })
 }catch(err){
  
 }
}