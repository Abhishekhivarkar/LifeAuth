import mongoose from "mongoose"
import bcryptjs from "bcryptjs"
const userSchema = new mongoose.Schema({
 firstName:{
  type:String,
  required:true,
  trim:true,
  lowercase:true
 },
 middleName:{
  type:String,
  required:true,
  trim:true,
  lowercase:true
 },
 lastName:{
  required:true,
  type:String,
  trim:true,
  lowercase:true
 },
 phoneNumber:{
  type:String,
  required:true,
  trim:true,
  minlength:10,
  maxlength:15
 },
 email:{
  type:String,
  unique:true,
  required:true,
  trim:true,
  lowercase:true,
  match:[
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    "Please use a valid email address"
  ]
 },
password:{
  type:String,
  required:function (){
    return this.role === "USER" || this.role === "ADMIN"
  },
  minlength:6,
  select:false
},
 role:{
  type:String,
  enum:["USER","NOMINEE","ADMIN"],
  default:"USER"
 },
 linkedUser:{
  type:mongoose.Schema.Types.ObjectId,
  ref:"User",
  default:null
 },
 relation:{
  type:String,
  default:null
 },
 status:{
  type:String,
  enum:["ACTIVE","EXPIRED","PENDING_DEATH_REVIEW","DECEASED"],
  default:"ACTIVE"
 },
 lastVerificationDate:{
  type:Date,
  default:null
 },
 loginAttempts:{
  type:Number,
  default:0
 },
 isEmailVerified:{
  type:Boolean,
  default:false
 },
 lockUntil:{
  type:Date,
  default:null
 },
 resetPasswordToken:{
  type:String
 },
 resetPasswordExpire:{
  type:Date
 },
 isResetPasswordExpire:{
  type:Boolean,
  default:false
 },
 verificationExpiresAt:{
  type:Date,
  default:null
 }
},{timestamps:true})

userSchema.pre("save",async function(){
 if (!this.isModified("password")){
 return
 }
 const hash = await bcryptjs.hash(this.password,10)
 
 this.password = hash
 
 return
})

userSchema.methods.comparePassword = async function(enteredPassword){
return await bcryptjs.compare(enteredPassword,this.password)
}

export default mongoose.model("User",userSchema)