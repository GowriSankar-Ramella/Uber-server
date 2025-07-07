const express = require("express")
const cookieParser = require("cookie-parser")
const userRouter = require("./routes/userRoutes")
const captainRouter = require("./routes/captainRoutes")

const app = express()

app.use(express.json())

app.use(cookieParser())

app.use(express.urlencoded({ extended: true }));

app.use("/user", userRouter)

app.use("/captain", captainRouter)

module.exports = app