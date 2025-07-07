const jwt = require("jsonwebtoken")
const User = require("../models/user.model")
const Captain = require("../models/captain.model")

const authUser = async (req, res, next) => {
    try {
        const { Uber } = req.cookies
        if (!Uber) {
            throw new Error("Please Login!!")
        }
        const decoded = jwt.verify(Uber, process.env.JWT_SECRET)
        const { _id } = decoded
        const user = await User.findById(_id).select("-password")
        if (!user) {
            throw new Error("User not found!!")
        }
        req.user = user
        next()
    } catch (error) {
        res.status(400).send("Error : " + error.message)
    }
}

const authCaptain = async (req, res, next) => {
    try {
        const { Uber } = req.cookies
        if (!Uber) {
            throw new Error("Please Login!!")
        }
        const decoded = jwt.verify(Uber, process.env.JWT_SECRET)
        const { _id } = decoded
        const captain = await Captain.findById(_id).select("-password")
        if (!captain) {
            throw new Error("User not found!!")
        }
        req.captain = captain
        next()
    } catch (error) {
        res.status(400).send("Error : " + error.message)
    }
}

module.exports = { authUser, authCaptain }