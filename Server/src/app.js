import express from "express"
import cookieParser from "cookie-parser"
import Cors from "cors"
import dotenv from "dotenv"
dotenv.config({ path: ".env" })

const app = express()
app.use(
  Cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
)

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ limit: "16kb", extended: true }))
app.use(express.static("public"))
app.use(cookieParser())

// Import routes
import authRouter from "./routes/auth.route.js"
import walletRouter from "./routes/wallet.route.js"
import beneficiaryRouter from "./routes/beneficiary.route.js"
import userRouter from "./routes/user.route.js"

// Route declarations
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/wallet", walletRouter)
app.use("/api/v1/beneficiaries", beneficiaryRouter)
app.use("/api/v1/users", userRouter)

// Health check route
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" })
})

export { app }