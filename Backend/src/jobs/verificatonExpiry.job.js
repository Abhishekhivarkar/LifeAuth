import LifeStatusRecordModel from "../models/LifeStatusRecord.model"
import UserModel from "../models/User.model"


// for loop cron job 

// export const verificationExpiry =async (req,res) =>{
//     try{
//         const now =new Date()

//         const expiredUser = await UserModel.find({
//             verificationExpiresAt:{
//                 $lt:now
//             },
//             status:"ACTIVE"
//         })

//         for (let user of expiredUser){
//             user.status = "EXPIRED"
//             await user.save()

//             const lifeStatus = await LifeStatusRecordModel.findOne({
//                 user:user._id,
//                 verificationStatus: "VERIFIED"
//             }).sort({verificationDate:-1})

//             if(lifeStatus){
//                 lifeStatus.verificationStatus = "EXPIRED"
//                 await lifeStatus.save()
//             }
//         }
//     }catch(err){
//         console.log("EXPIRY CRON JOB ERROR : ",err)
//     }
// }

// bulk update cron job

export const verificationExpiryLogic =async() =>{
    try{
       const now = new Date()

        const expirdUser = await UserModel.find({
            verificationExpiresAt:{
                $lt:now
            },
            status:"ACTIVE"
        }).select("_id")

        if (expirdUser.length === 0){
            return 
        }

        const userIds = expirdUser.map(user => user._id)

        await UserModel.updateMany(
            {_id:{$in:userIds}},
            {$set:{status:"EXPIRED"}}
        ) 

        await LifeStatusRecordModel.updateMany(
            {user:{$in:userIds},verificationStatus:"VERIFIED",verificationExpiresAt:{$lt:now}},
            {$set:{verificationStatus:"EXPIRED"}}
        )
    }catch(err){
        console.log("verification expiry job failed : ",err)
    }
}

export const startVerificationExpiryJob = () =>{
    cron.schedule("0 0 * * *", async()=>{
        await verificationExpiryLogic()
    })
}