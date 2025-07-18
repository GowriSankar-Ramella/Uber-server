const mongoose = require("mongoose")

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.DB_URI)
        console.log("Connected to database successfully!!")
    } catch (error) {
        console.log(error)
    }
}

module.exports = connectDb