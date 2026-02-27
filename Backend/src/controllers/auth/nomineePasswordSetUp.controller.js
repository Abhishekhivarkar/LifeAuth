import userModel from "../../models/User.model.js";
import jwt from "jsonwebtoken";
import {config} from "../../configs/env.config.js"




export const nomineePasseordSetUp = async (req,res) =>{
 try{
  const {token,password}= req.body
  
  if(!token || !password){
   return res.status(401).json({
    success:false,
    message:"Token and Password are required!"
   })
  }
  
  let decoded
  try{
   decoded = jwt.verify(token,config.JWT_SECRET)
  }catch(err){
   return res.status(403).json({
    success:false,
    message:"Invalid or Expired token"
   })
  }
  
  if(decoded.role !== "NOMINEE"){
   return res.status(401).json({
    success:false,
    message:"Unauthorized access"
   })
  }
  
  const nominee = await userModel.findById(decoded.id).select("+password")
  
  if(!nominee){
   return res.status(404).json({
    success:false,
    message:"Nominee not found"
   })
  }
  
  if(nominee.role !== "NOMINEE"){
   return res.status(403).json({
    success:false,
    message:"Unauthorized access"
   })
  }
  
  if(nominee.isEmailVerified){
   return res.status(400).json({
    success:false,
    message:"Password already set"
   })
  }
  
  nominee.password = password
  nominee.isEmailVerified = true
  await nominee.save()
  
  return res.status(200).json({
   success:true,
   message:"Password set successfully."
  })
 }catch(err){ 
  console.log("NOMINEE PASSWORD SET API ERROR : ",err)
  res.status(500).json({
   success:false,
   message:"Failed to set nominee password"
  })
 }
}