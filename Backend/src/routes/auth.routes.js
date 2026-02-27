import {registerValidator,loginValidator} from "../validators/auth.validator.js"
import {register,login,logout,verifyEmail,nomineePasseordSetUp} from "../controllers/auth/index.js"
import express from "express"
import {validate} from "../middlewares/validate.middleware.js"
const router = express.Router()

router.post("/auth/register",validate(registerValidator),register)

router.post("/auth/login",validate(loginValidator),login)

router.post("/auth/logout",logout)

router.post("/auth/verify-mail",verifyEmail)

router.post("/auth/nominee-password-setup",nomineePasseordSetUp)

export default router