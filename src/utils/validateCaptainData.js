const Captain = require("../models/captain.model")
const validator = require("validator")

const validateCaptainSignupData = async (req) => {
    const { firstName, lastName, email, password, vehicle } = req.body
    if (!firstName) {
        throw new Error("Firstname cannot be empty!!")
    }
    if (!validator.isEmail(email)) {
        throw new Error("Email is not valid!!")
    }
    if (!validator.isStrongPassword(password)) {
        throw new Error("Password is too weak!!")
    }
    const exist = await Captain.findOne({ email })
    if (exist) {
        throw new Error("Email is already registered!!")
    }
    if (!vehicle) {
        throw new Error("Vehicle information is required")
    }
    if (!vehicle.color) {
        throw new Error("Vehicle color is required")
    }
    if (!vehicle.plate) {
        throw new Error("Vehicle plate is required")
    }
    if (!vehicle.capacity) {
        throw new Error("Vehicle capacity is required")
    }
    if (!vehicle.vehicleType) {
        throw new Error("Vehicle type is required")
    }
}

module.exports = validateCaptainSignupData