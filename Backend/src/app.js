import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import authRoutes from "./routes/auth.routes.js"
import submitLifeStatusRoutes from "./routes/lifeStatus.routes.js"


const app = express()

app.use(cors())
app.use(express.json())
app.use(cookieParser())


app.use("/api", authRoutes)
app.use("/api", submitLifeStatusRoutes)

app.use("/health",(_,res)=>{
 res.status(200).json({
  success:true,
  status:"OK"
 })
})


export default app