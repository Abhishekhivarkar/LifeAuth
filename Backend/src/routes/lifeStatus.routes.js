import { submitLifeStatus ,getLifeStatusRecordById,getLifeStatusPendingRecords} from "../controllers/core/index.js";
import express from "express"
import {authMiddleware} from "../middlewares/auth.middleware.js"
import {roleMiddleware} from "../middlewares/role.middleware.js"
import {upload} from "../middlewares/upload.middleware.js"


const router = express.Router()
// User routes
router.post("/life-status/submit",authMiddleware,roleMiddleware("USER"),upload.single("selfieImage"),submitLifeStatus)

// Admin Routes
router.patch("/life-status/review/:recordId",authMiddleware,roleMiddleware("ADMIN"),getLifeStatusRecordById)

router.get("/life-status/pending",authMiddleware,roleMiddleware("ADMIN"),getLifeStatusPendingRecords)
export default router