require("dotenv").config()
const { initializeSocket } = require("./utils/socket")
const app = require("./app")
const http = require("http")
const connectDb = require("./config/db.config")

const server = http.createServer(app)

initializeSocket(server)

connectDb().then(() => {
    server.listen(3000, () => {
        console.log("Server is running at port : 3000")
    })
}).catch((error) => {
    console.log(error)
})

