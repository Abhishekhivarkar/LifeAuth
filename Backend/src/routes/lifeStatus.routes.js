import { submitLifeStatus } from "../controllers/core/index.js";
import express from "express"
import {authMiddleware} from "../middlewares/auth.middleware.js"
import {roleMiddleware} from "../middlewares/role.middleware.js"
import {upload} from "../middlewares/upload.middleware.js"


const router = express.Router()
router.post("/submit",authMiddleware,roleMiddleware("USER"),upload.single("selfieImage"),submitLifeStatus)

export default router