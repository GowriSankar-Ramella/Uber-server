const express = require("express")
const { authUser, authCaptain } = require("../middleware/auth")
const { createRide, getFares, confirmRide, startRide, endRide } = require("../controllers/rideController")

const rideRouter = express.Router()

rideRouter.post("/create", authUser, createRide)

rideRouter.get('/get-fare', authUser, getFares);

rideRouter.post('/confirm', authCaptain, confirmRide)

rideRouter.get('/start-ride', authCaptain, startRide);

rideRouter.post('/end-ride', authCaptain, endRide);

module.exports = rideRouter