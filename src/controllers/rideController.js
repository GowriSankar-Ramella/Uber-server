const Ride = require('../models/ride.model');
const { sendMessageToSocketId } = require('../utils/socket');
const { geocodeAddress, getCaptainsInTheRadius } = require('./mapController');
const axios = require('axios');

const KRUTRIM_API_KEY = process.env.KRUTRIM_MAPS_API_KEY;

// Fare calculation function
const calculateFare = (distance, duration, vehicleType) => {
    const fares = {
        car: {
            baseFare: 10,
            perKm: 5,
            perMin: 1.5
        },
        auto: {
            baseFare: 10,
            perKm: 3,
            perMin: 1
        },
        moto: {
            baseFare: 5,
            perKm: 2,
            perMin: 0.8
        }
    };

    const fare = fares[vehicleType];
    if (!fare) {
        throw new Error('Invalid vehicle type');
    }

    const totalFare = fare.baseFare + (distance * fare.perKm) + (duration * fare.perMin);
    return Math.round(totalFare); // return whole number fare
};

// Function to get distance and time between two addresses
const getDistanceAndTime = async (origin, destination) => {
    try {
        const [originCoords, destinationCoords] = await Promise.all([
            geocodeAddress(origin),
            geocodeAddress(destination)
        ]);

        // Check if both coordinates are exactly the same
        if (originCoords.lat === destinationCoords.lat && originCoords.lng === destinationCoords.lng) {
            return { distance: 0, duration: 0 };
        }

        const originsParam = `${originCoords.lat},${originCoords.lng}`;
        const destinationsParam = `${destinationCoords.lat},${destinationCoords.lng}`;

        const url = `https://api.olamaps.io/routing/v1/distanceMatrix?origins=${encodeURIComponent(originsParam)}&destinations=${encodeURIComponent(destinationsParam)}&api_key=${KRUTRIM_API_KEY}`;

        const { data } = await axios.get(url);

        const element = data?.rows?.[0]?.elements?.[0];

        if (element?.distance != null && element?.duration != null) {
            const distance = Math.ceil(element.distance / 1000); // Convert to km
            const duration = Math.ceil(element.duration / 60); // Convert to minutes

            // Handle case where API returns 0 distance
            if (distance === 0 && duration === 0) {
                return {
                    distance: 0.1, // Minimum 0.1 km
                    duration: 5    // Minimum 5 minutes
                };
            }

            return { distance, duration };
        } else {
            throw new Error('Distance/Time data not found in API response');
        }
    } catch (error) {
        throw new Error('Failed to get distance and time from Krutrim API');
    }
};

// Generate OTP
const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};

// Helper function to format duration
const formatDuration = (minutes) => {
    if (minutes < 60) {
        return `${minutes} mins`;
    } else {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        if (remainingMinutes === 0) {
            return `${hours} hr${hours > 1 ? 's' : ''}`;
        } else {
            return `${hours} hr${hours > 1 ? 's' : ''} ${remainingMinutes} mins`;
        }
    }
};

// Create Ride Controller
const createRide = async (req, res) => {
    try {
        const { pickup, destination, vehicleType } = req.body;
        const userId = req.user.id; // Assuming user info is available in req.user

        // Validate required fields
        if (!pickup || !destination || !vehicleType) {
            return res.status(400).json({
                error: 'Pickup, destination, and vehicle type are required'
            });
        }

        // Validate vehicle type
        const validVehicleTypes = ['car', 'auto', 'moto'];
        if (!validVehicleTypes.includes(vehicleType)) {
            return res.status(400).json({
                error: 'Vehicle type must be one of: car, auto, moto'
            });
        }

        // Get distance and time
        const { distance, duration } = await getDistanceAndTime(pickup, destination);

        // Calculate fare
        const fare = calculateFare(distance, duration, vehicleType);

        // Generate OTP
        const otp = generateOTP();

        // Create ride
        const ride = new Ride({
            user: userId,
            pickup,
            destination,
            fare,
            duration,
            distance,
            otp,
            vehicleType
        });

        await ride.save();

        // Return ride details (excluding OTP for security)
        const rideResponse = {
            id: ride._id,
            pickup,
            destination,
            fare,
            otp,
            duration: formatDuration(duration),
            distance: `${distance} km`,
            vehicleType,
            status: ride.status,
            createdAt: ride.createdAt
        };

        res.status(201).json({
            message: 'Ride created successfully',
            ride: rideResponse
        });

        const pickupCords = await geocodeAddress(pickup)

        const captainsInRadius = await getCaptainsInTheRadius(pickupCords.lat, pickupCords.lng, 50);

        const rideWithUser = await Ride.findOne({ _id: ride._id }).populate('user');

        captainsInRadius.map(captain => {

            sendMessageToSocketId(captain.socketId, {
                event: 'new-ride',
                data: rideWithUser
            })
        })

    } catch (error) {
        res.status(500).json({
            error: 'Failed to create ride',
            details: error.message
        });
        console.log(error)
    }
};

// Get Fares Controller - calculates fares for all vehicle types
const getFares = async (req, res) => {
    try {
        const { pickup, destination } = req.query;

        // Validate required fields
        if (!pickup || !destination) {
            return res.status(400).json({
                error: 'Pickup and destination are required'
            });
        }

        // Get distance and time between pickup and destination
        const { distance, duration } = await getDistanceAndTime(pickup, destination);

        // Calculate fares for all vehicle types
        const vehicleTypes = ['car', 'auto', 'moto'];
        const fares = {};

        vehicleTypes.forEach(vehicleType => {
            const fare = calculateFare(distance, duration, vehicleType);
            fares[vehicleType] = {
                fare,
                duration: formatDuration(duration),
                distance: `${distance.toFixed(1)} km`
            };
        });

        return res.status(200).json({
            success: true,
            pickup,
            destination,
            fares,
            totalDistance: `${distance.toFixed(1)} km`,
            totalDuration: formatDuration(duration)
        });

    } catch (error) {
        return res.status(500).json({
            error: 'Failed to calculate fares',
            details: error.message
        });
    }
};

const confirmRide = async (req, res) => {
    try {
        const { rideId, captainId } = req.body;

        // Validate required fields
        if (!rideId || !captainId) {
            return res.status(400).json({
                error: 'Ride ID and Captain ID are required'
            });
        }

        await Ride.findOneAndUpdate({ _id: rideId, status: 'pending' }, { status: 'accepted', captain: captainId });

        const ride = await Ride.findById(rideId).populate('user').populate('captain').select('+otp');

        if (!ride) {
            return res.status(404).json({
                error: 'Ride not found or already accepted'
            });
        }

        // Notify the captain about the user about ride confirmation
        sendMessageToSocketId(ride.user.socketId, {
            event: 'ride-confirmed',
            data: ride
        });
        return res.status(200).json({
            message: 'Ride confirmed successfully',
            ride
        });
    } catch (error) {
        return res.status(500).json({
            error: 'Failed to confirm ride',
            details: error.message
        });
    }
};

const startRide = async (req, res) => {
    try {
        const { rideId, otp } = req.query;

        // Validate required fields
        if (!rideId || !otp) {
            return res.status(400).json({
                error: 'Ride ID and OTP are required'
            });
        }

        const ride = await Ride.findOne({ _id: rideId, otp }).populate('user').populate('captain').select('+otp');

        if (!ride) {
            return res.status(404).json({
                error: 'Ride not found or invalid OTP'
            });
        }

        // Update ride status to 'ongoing'
        ride.status = 'ongoing';
        await ride.save();

        // Notify the user about the ride start
        sendMessageToSocketId(ride.user.socketId, {
            event: 'ride-started',
            data: ride
        });

        return res.status(200).json({
            message: 'Ride started successfully',
            ride
        });
    } catch (error) {
        return res.status(500).json({
            error: 'Failed to start ride',
            details: error.message
        });
    }
};

const endRide = async (req, res) => {
    try {
        const { rideId } = req.body;

        // Validate required fields
        if (!rideId) {
            return res.status(400).json({
                error: 'Ride ID is required'
            });
        }

        const ride = await Ride.findById(rideId).populate('user').populate('captain');

        if (!ride) {
            return res.status(404).json({
                error: 'Ride not found'
            });
        }

        // Update ride status to 'completed'
        ride.status = 'completed';

        await ride.save();

        // Notify the user about the ride completion
        sendMessageToSocketId(ride.user.socketId, {
            event: 'ride-ended',
            data: ride
        });

        return res.status(200).json({
            message: 'Ride ended successfully',
            ride
        });
    } catch (error) {
        return res.status(500).json({
            error: 'Failed to end ride',
            details: error.message
        });
    }
};

module.exports = {
    createRide,
    calculateFare,
    getDistanceAndTime,
    startRide,
    formatDuration,
    getFares,
    confirmRide,
    endRide
};