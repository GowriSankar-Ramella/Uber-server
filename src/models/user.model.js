const mongoose = require("mongoose")
const validator = require("validator")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Invalid Email Address :", value)
            }
        }
    },
    password: {
        type: String,
        required: true,
        validate(value) {
            if (!validator.isStrongPassword(value)) {
                throw new Error("Password is too weak")
            }
        }
    },
    socketId: {
        type: String
    }
}, { timestamps: true })


userSchema.methods.getJWT = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" })
    return token
}

userSchema.methods.verifyPassword = async function (inputPass) {
    const user = this
    const hashedPassword = user.password
    const isValid = await bcrypt.compare(inputPass, hashedPassword)
    return isValid
}

const User = new mongoose.model("User", userSchema)

module.exports = User