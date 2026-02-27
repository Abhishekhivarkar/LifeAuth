import userModel from "../../models/User.model.js";
import jwt from "jsonwebtoken";
import {config} from "../../configs/env.config.js"



export const login = async(req,res) =>{
 try{
  const {email,password} = req.body
  
  const user = await userModel.findOne({email}).select("+password")
  
  if(!user){
   return res.status(404).json({
    success:false,
    message:"User not found"
   })
  }
  
  if(user.isEmailVerified === false){
   return res.status(400).json({
    success:false,
    message:"Email is not verified"
   })
  }
  
  
  
if (user.lockUntil) {


  if (user.lockUntil > Date.now()) {
    const timeRemaining = user.lockUntil - Date.now();
    const remainingMinutes = Math.ceil(timeRemaining / (1000 * 60));

    return res.status(403).json({
      success: false,
      message: `Account is blocked temporarily. Try again in ${remainingMinutes} minutes`
    });
  }

 
  user.loginAttempts = 0;
  user.lockUntil = null;
  await user.save();
}
  const isMatch = await user.comparePassword(password)
  
  if (!isMatch) {
  user.loginAttempts += 1;

  if (user.loginAttempts >= 5) {
    user.lockUntil = Date.now() + 15 * 60 * 1000;
  }

  await user.save();

  const remainingAttempts = Math.max(0, 5 - user.loginAttempts);

  return res.status(401).json({
    success: false,
    message: `Incorrect password! Remaining attempts: ${remainingAttempts}`
  });
}
  user.loginAttempts = 0
  user.lockUntil = null
  
  await user.save()
  
  const token = jwt.sign(
   {id:user._id,role:user.role},
   config.JWT_SECRET,
   {expiresIn:"1d"}
   )
   
   res.cookie("token",token)
   
  return res.status(200).json({
   success:true,
   message:"Logged in Successfully!",
   token
  })
 }catch(err){
  console.log("LOGIN API ERROR : ",err)
  res.status(500).json({
   success:false,
   message:"Failed to login"
  })
 }
}