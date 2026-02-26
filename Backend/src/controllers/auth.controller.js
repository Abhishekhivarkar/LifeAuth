import userModel from "../models/User.model.js";
import jwt from "jsonwebtoken";
import {config} from "../configs/env.config.js"
import blackListTokenModel from "../models/BlackListToken.model.js"
import {sendUserVerificationEmail,sendNomineeSetupEmail} from "../services/mail.service.js"
const generateToken = (payload, expiresIn = "1h") => {
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn });
};

export const register = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { firstName, middleName, lastName, phoneNumber, email, password, nominee } = req.body;

    const existingUser = await userModel.findOne({ email }).session(session);

    if (existingUser) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "User with this email already exists"
      });
    }

    const newUserArr = await userModel.create([{
      firstName,
      middleName,
      lastName,
      phoneNumber,
      email,
      password,
      role: "USER",
      status: "ACTIVE",
      isEmailVerified: false
    }], { session });

    const newUser = newUserArr[0];

    let nomineeUser = await userModel.findOne({ email: nominee.email }).session(session);

    if (nomineeUser) {
      if (nomineeUser.role !== "NOMINEE") {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: "Nominee email already registered as normal user"
        });
      }

      nomineeUser.linkedUser = newUser._id;
      nomineeUser.relation = nominee.relation;
      await nomineeUser.save({ session });

    } else {
      const nomineeArr = await userModel.create([{
        firstName: nominee.firstName,
        middleName: nominee.middleName || "",
        lastName: nominee.lastName,
        phoneNumber: nominee.phoneNumber || "0000000000",
        email: nominee.email,
        role: "NOMINEE",
        linkedUser: newUser._id,
        relation: nominee.relation,
        isEmailVerified: false
      }], { session });

      nomineeUser = nomineeArr[0];
    }

    await session.commitTransaction();
    session.endSession();

    // 🔥 Send email AFTER commit
    const userVerifyToken = generateToken({ id: newUser._id, role: "USER" });
    const nomineeSetupToken = generateToken({ id: nomineeUser._id, role: "NOMINEE" });

    try {
      await sendUserVerificationEmail(newUser.email, userVerifyToken);
      await sendNomineeSetupEmail(nomineeUser.email, nomineeSetupToken);
    } catch (mailError) {
      console.error("Email failed:", mailError.message);
    }

    return res.status(201).json({
      success: true,
      message: "Registration successful. Verification required."
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("REGISTER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Registration failed"
    });
  }
};


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


export const logout = async (req,res) =>{
 try{
  const token = req.cookies?.token || res.headers.authorization?.split(" ")[1]
  
  if(!token){
   return res.status(200).json({
    success:true,
    message:"Logout successfully!"
   })
  }
  
  res.cookie("token","")
  
  await blackListTokenModel.create({
   token
  })
  
 return res.status(200).json({
  success:true,
  message:"Logout successfully!"
 })
 }catch(err){
  console.log("LOGOUT API ERROR : ",err)
  res.status(500).json({
   success:false,
   message:"Failed to logout"
  })
 }
}