import jwt from "jsonwebtoken" 
import {config} from "../configs/env.config.js"
import userModel from "../models/User.model.js"
import blackListTokenModel from "../models/BlackListToken.model.js"
export const authMiddleware =async (req,res,next) =>{
 try{
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1]
  
  if(!token){
   return res.status(404).json({
    success:false,
    message:"Token not found"
   })
  }
  
  const isBlackListed = await blackListTokenModel.findOne({token})
  
  if(isBlackListed){
   return res.status(403).json({
    success:false,
    message:"Invalid or expired token"
   })
  }
  
  let verify
  try{
   verify = jwt.verify(token,config.JWT_SECRET)
  }catch(err){
   return res.status(401).json({
    success:false,
    message:"Invalid or expired token"
   })
  }
  
  const user = await userModel.findById(verify.id)
  if(!user){
   return res.status(404).json({
    success:false,
    message:"User not found"
   })
  }
  
  req.user = user
  next()
 }catch(err){
  console.log("AUTH MIDDLEWARE ERROR : ",err)
  res.status(500).json({
   success:false,
   message:"auth middleware failed"
  })
 }
}