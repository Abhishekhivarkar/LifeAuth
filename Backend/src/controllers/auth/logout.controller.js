
import blackListTokenModel from "../../models/BlackListToken.model.js"



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