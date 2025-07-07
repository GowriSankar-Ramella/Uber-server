const express = require("express")
const { captainSignUp, captainLogin, captainLogout, getCaptainProfile } = require("../controllers/captainControllers")
const { authCaptain } = require("../middleware/auth")

const captainRouter = express.Router()

captainRouter.post("/signup", captainSignUp)
captainRouter.post("/login", captainLogin)
captainRouter.get("/logout", authCaptain, captainLogout)
captainRouter.get("/profile", authCaptain, getCaptainProfile)

module.exports = captainRouter