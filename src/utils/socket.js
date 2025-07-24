const socketIo = require('socket.io');
const User = require("../models/user.model")
const Captain = require("../models/captain.model")

let io;

function initializeSocket(server) {
    io = socketIo(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        console.log(`Client connected: ${socket.id}`);

        socket.on('join', async (data) => {
            try {
                const { userId, userType } = data;

                // Add validation
                if (!userId || !userType) {
                    console.log('Invalid join data:', data);
                }

                console.log(`User joining: ${userType} with ID: ${userId}, Socket: ${socket.id}`);

                let updatedUser;

                if (userType === 'user') {
                    updatedUser = await User.findByIdAndUpdate(
                        userId,
                        { socketId: socket.id },
                        { new: true } // Return updated document
                    );

                    if (!updatedUser) {
                        console.log(`User not found with ID: ${userId}`);
                    }

                    console.log(`User socketId updated successfully: ${updatedUser.socketId}`);

                } else if (userType === 'captain') {
                    updatedUser = await Captain.findByIdAndUpdate(
                        userId,
                        { socketId: socket.id },
                        { new: true } // Return updated document
                    );

                    if (!updatedUser) {
                        console.log(`Captain not found with ID: ${userId}`);
                    }

                    console.log(`Captain socketId updated successfully: ${updatedUser.socketId}`);

                } else {
                    console.log(`Invalid userType: ${userType}`);
                }

            } catch (error) {
                console.error('Error in join event:', error);
            }
        });

        socket.on('update-location-captain', async (data) => {
            try {
                const { userId, location } = data;

                if (!location || !location.ltd || !location.lng) {
                    throw new error("Invalid location data")
                }

                const updatedCaptain = await Captain.findByIdAndUpdate(userId, {
                    location: {
                        ltd: location.ltd,
                        lng: location.lng
                    }
                }, { new: true });

                if (!updatedCaptain) {
                    throw new error("Captain not found")
                }

                console.log(`Captain location updated: ${userId}`);

            } catch (error) {
                console.error('Error updating captain location:', error);
            }
        });

        socket.on('disconnect', async () => {
            try {
                console.log(`Client disconnected: ${socket.id}`);

                // Optional: Clear socketId on disconnect
                await User.findOneAndUpdate(
                    { socketId: socket.id },
                    { $unset: { socketId: 1 } }
                );

                await Captain.findOneAndUpdate(
                    { socketId: socket.id },
                    { $unset: { socketId: 1 } }
                );

            } catch (error) {
                console.error('Error handling disconnect:', error);
            }
        });
    });
}

const sendMessageToSocketId = (socketId, messageObject) => {

    if (io) {
        console.log(`Sending message to socketId: ${socketId}, Event: ${messageObject.event}`);
        io.to(socketId).emit(messageObject.event, messageObject.data);
    } else {
        console.log('Socket.io not initialized.');
    }
}

module.exports = { initializeSocket, sendMessageToSocketId };
