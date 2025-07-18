const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const userRouter = require("./routes/userRoutes")
const captainRouter = require("./routes/captainRoutes")
const mapRouter = require("./routes/mapRoutes")

const app = express()

app.use(express.json())

app.use(cookieParser())

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))


app.use(express.urlencoded({ extended: true }));

app.use("/user", userRouter)

app.use("/captain", captainRouter)

app.use("/map", mapRouter)

module.exports = app