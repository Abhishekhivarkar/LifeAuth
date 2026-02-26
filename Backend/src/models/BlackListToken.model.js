import mongoose from "mongoose"

const blackListTokenSchema = new mongoose.Schema({
 token:{
  type:String,
  unique:true,
  required:true
 }
},{timestamps:true})

blackListTokenSchema.index(
 {createdAt:1},
{expireAfterSeconds:60*60*24*3})

export default mongoose.model("BlackListToken",blackListTokenSchema)
