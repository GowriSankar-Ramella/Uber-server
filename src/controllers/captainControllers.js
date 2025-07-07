const Captain = require("../models/captain.model")
const validateCaptainSignupData = require("../utils/validateCaptainData")
const bcrypt = require("bcrypt")


const captainSignUp = async (req, res) => {
    try {
        validateCaptainSignupData(req)
        const { firstName, lastName, email, password, vehicle } = req.body
        const hashedPassword = await bcrypt.hash(password, 10)
        const captain = new Captain({ firstName, lastName, email, vehicle, password: hashedPassword })
        const saved = await captain.save()
        const token = await saved.getJWT()
        res.cookie("Uber", token, { maxAge: 1 * 24 * 60 * 60 * 1000 }).status(200).json(saved)
    } catch (error) {
        res.status(400).send("Error : " + error.message)
    }
}

const captainLogin = async (req, res) => {
    try {
        const { email, password } = req.body
        const captain = await Captain.findOne({ email })
        if (!captain) {
            throw new Error("Captain not found!!")
        }
        const isValid = await captain.verifyPassword(password)
        if (!isValid) {
            throw new Error("Invalid credentials!!")
        }
        const token = await captain.getJWT()
        res.cookie("Uber", token, { maxAge: 1 * 24 * 60 * 60 * 1000 }).status(200).json(captain)
    } catch (error) {
        res.status(400).send("Error : " + error.message)
    }
}

const captainLogout = (req, res) => {
    res.clearCookie("Uber").send("LoggedOut successfully!!")
}

const getCaptainProfile = (req, res) => {
    res.status(200).json(req.captain)
}

module.exports = { captainSignUp, captainLogin, captainLogout, getCaptainProfile }