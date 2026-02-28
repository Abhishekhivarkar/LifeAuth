import mongoose from "mongoose"

const lifeStatusRecordSchema = new mongoose.Schema({
 
 user:{
  type:mongoose.Schema.Types.ObjectId,
  ref:"User",
  required:true,
  index:true
 },
 selfieImage:{
  type:String,
  required:true,
 },
 verificationStatus:{
  type:String,
  enum:["PENDING","VERIFIED","REJECTED","EXPIRED"],
  default:"PENDING"
 },
 verificationDate:{
  type:Date,
  default:null
 },
 verificationExpiresAt:{
  type:Date,
  default:null
 },
 faceMatchScore:{
  type:Number,
  min:0,
  max:100,
  default:null
 },
 reviewedBy:{
  type:mongoose.Schema.Types.ObjectId,
  ref:"User",
  default:null
 },
 reviewDate:{
  type:Date,
  default:null
 },
 remark:{
  type:String,
  default:null,
  trim:true
 }
},{timestamps:true})

export default mongoose.model("LifeVerification",lifeStatusRecordSchema)