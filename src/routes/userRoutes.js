const express = require("express")
const { signup, login, logout, getProfile } = require("../controllers/userControllers")
const { authUser } = require("../middleware/auth")

const userRouter = express.Router()

userRouter.post("/signup", signup)
userRouter.post("/login", login)
userRouter.get("/logout", authUser, logout)
userRouter.get("/profile", authUser, getProfile)

module.exports = userRouter