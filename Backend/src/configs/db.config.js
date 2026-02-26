import mongoose from "mongoose"
import {config} from "../configs/env.config.js"
export const connectDB = async () =>{
 try{
  await mongoose.connect(config.MONGO_URI)
  
  console.log("database connected successfully")
 }catch(err){
  console.log("DATABASE CONNECTION ERROR : ",err)
 }
}