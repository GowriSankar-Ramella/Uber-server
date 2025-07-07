const validator = require("validator")
const User = require("../models/user.model")


const validateSignupData = async (req) => {

    const { firstName, lastName, email, password } = req.body
    if (!firstName) {
        throw new Error("Firstname cannot be empty!!")
    }
    if (!validator.isEmail(email)) {
        throw new Error("Email is not valid!!")
    }
    if (!validator.isStrongPassword(password)) {
        throw new Error("Password is too weak!!")
    }
    const exist = await User.findOne({ email })
    if (exist) {
        throw new Error("Email is already registered!!")
    }
}

module.exports = { validateSignupData }