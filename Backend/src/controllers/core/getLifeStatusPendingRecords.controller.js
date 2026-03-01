import LifeStatusRecord from "../../models/LifeStatusRecord.model.js"
import redisClient from "../../redis/redisClient.js"


export const getLifeStatusPendingRecords = async (req, res) => {
 try {

    const cachedKey = `record:pending`

    const cachedPendingRecords = await redisClient.get(cachedKey)

 
    if (cachedPendingRecords) {

        const parsedData = JSON.parse(cachedPendingRecords)
   console.log("From Redis")
        if (parsedData.length === 0) {
            return res.status(200).json({
                success: false,
                message: "0 records found"
            })
        }

     

        return res.status(200).json({
            success: true,
            data: parsedData,
            count: parsedData.length
        })
    }


    const record = await LifeStatusRecord.find({
        verificationStatus: "PENDING"
    }).populate("user",
        "firstName middleName lastName phoneNumber email lastVerificationDate verificationExpiresAt"
    )

    
    await redisClient.set(
        cachedKey,
        JSON.stringify(record),
        { EX: 600 }
    )

    console.log("From MongoDB")

    if (record.length === 0) {
        return res.status(400).json({
            success: false,
            message: "0 records found"
        })
    }

    return res.status(200).json({
        success: true,
        data: record,
        count: record.length
    })

 } catch (err) {
    console.log("GET LIFE STATUS PENDING RECORDS ERROR:", err)
    return res.status(500).json({
        success: false,
        message: "Failed to get pending records"
    })
 }
}