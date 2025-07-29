const User = require("../models/user.model")
const { validateSignupData } = require("../utils/validateData")
const bcrypt = require("bcrypt")


const signup = async (req, res) => {
    try {
        validateSignupData(req)
        const { firstName, lastName, email, password } = req.body
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = new User({ firstName, lastName, email, password: hashedPassword })
        const saved = await user.save()
        const token = await saved.getJWT()
        res.cookie("Uber", token, {
            maxAge: 1 * 24 * 60 * 60 * 1000, httpOnly: true,
            secure: true,
            sameSite: 'none'
        }).status(200).json(saved)
    } catch (error) {
        res.status(400).send("Error : " + error.message)
    }
}


const login = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email })
        if (!user) {
            throw new Error("User not exist!!!")
        }
        const isValid = await user.verifyPassword(password)
        if (!isValid) {
            throw new Error("Invalid Credentials!!")
        }
        const token = await user.getJWT()
        res.status(200).cookie("Uber", token, {
            maxAge: 1 * 24 * 60 * 60 * 1000, httpOnly: true,
            secure: true,
            sameSite: 'none'
        }).json(user)
    } catch (error) {
        res.status(400).send("Error : " + error.message)
    }
}

const logout = (req, res) => {
    res.clearCookie("Uber").send("Loggedout Successfully!!")
}

const getProfile = (req, res) => {
    const user = req.user
    res.status(200).json(user)
}

module.exports = { signup, login, logout, getProfile }