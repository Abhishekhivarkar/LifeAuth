import userModel from "../../models/User.model.js";
import jwt from "jsonwebtoken";
import {config} from "../../configs/env.config.js"



export const verifyEmail = async (req,res) =>{
 try{
  const {token} = req.body
  
  if(!token){
   return res.status(400).json({
    success:false,
    message:"Token is required!"
   })
  }
  
  const decoded = jwt.verify(token,config.JWT_SECRET)
  
  if(!decoded){
   return res.status(400).json({
    success:false,
    message:"Invalid or expired token"
   })
  }
  
  if(decoded.role !== "USER"){
   return res.status(403).json({
    success:false,
    message:"Unauthorized access"
   })
  }
  
  const user = await userModel.findById(decoded.id)
  
  if(!user){
   return res.status(404).json({
    success:false,
    message:"User not found"
   })
  }
  
  if(user.role !== "USER"){
   return res.status(403).json({
    success:false,
    message:"Unauthorized access"
   })
  }
  
  if(user.isEmailVerified){
   return res.status(400).json({
    success:false,
    message:"User email already verified"
   })
  }
  
  user.isEmailVerified = true
  await user.save()
  
  return res.status(200).json({
   success:true,
   message:"User email verified successfully"
  })
 }catch(err){
  console.log("USER EMAIL VERIFICATION API ERROR : ",err)
  res.status(500).json({
   success:false,
   message:"Failed to verify user email"
  })
 }
}