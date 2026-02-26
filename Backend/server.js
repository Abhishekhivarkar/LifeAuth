import express from "express"
import {connectDB} from "./src/configs/db.config.js"
import {config} from "./src/configs/env.config.js"
import app from "./src/app.js"
const PORT = config.PORT || 5000
const startServer =async (_,res) =>{
 try{
  await connectDB()
  
  app.listen(PORT,()=>{
   console.log("server running on port",PORT)
  })
 }catch(err){
  console.log("SERVER START ERROR : ",err)
  res.status(500).json({
   success:false,
   message:"Failed to start server"
  })
 }
}


startServer()