const axios = require('axios');
const Captain = require("../models/captain.model")

const KRUTRIM_API_KEY = process.env.KRUTRIM_MAPS_API_KEY;

const geocodeAddress = async (address) => {
    const url = `https://api.olamaps.io/places/v1/geocode?address=${encodeURIComponent(address)}&api_key=${KRUTRIM_API_KEY}`;
    const { data } = await axios.get(url);

    if (data?.geocodingResults?.length > 0) {
        const location = data.geocodingResults[0].geometry.location;
        return { lat: location.lat, lng: location.lng };
    }

    throw new Error(`Failed to geocode address: ${address}`);
};


const getCoordinatesFromAddress = async (req, res) => {
    const { address } = req.query;

    if (!address) {
        return res.status(400).json({ error: 'Address query parameter is required' });
    }

    try {
        const { lat, lng } = await geocodeAddress(address);
        return res.json({ lat, lng });
    } catch (error) {
        console.error('Geocoding error:', error.response?.data || error.message);
        return res.status(500).json({ error: 'Failed to fetch coordinates from Krutrim Maps API' });
    }
};


const getDistanceAndTime = async (req, res) => {
    const { origin, destination } = req.query;

    if (!origin || !destination) {
        return res.status(400).json({ error: 'Both origin and destination are required' });
    }

    try {
        const [originCoords, destinationCoords] = await Promise.all([
            geocodeAddress(origin),
            geocodeAddress(destination)
        ]);
        if (!originCoords || !destinationCoords) {
            return res.status(400).json({ error: 'Invalid origin or destination' });
        }

        const originsParam = `${originCoords.lat},${originCoords.lng}`;
        const destinationsParam = `${destinationCoords.lat},${destinationCoords.lng}`;

        const url = `https://api.olamaps.io/routing/v1/distanceMatrix?origins=${encodeURIComponent(originsParam)}&destinations=${encodeURIComponent(destinationsParam)}&api_key=${KRUTRIM_API_KEY}`;
        const { data } = await axios.get(url);

        const element = data?.rows?.[0]?.elements?.[0];

        if (element?.distance != null && element?.duration != null) {
            return res.json({
                origin,
                destination,
                originCoords,
                destinationCoords,
                distance: `${(element.distance / 1000).toFixed(2)} km`,
                duration: `${Math.ceil(element.duration / 60)} mins`
            });

        } else {
            return res.status(500).json({ error: 'Distance/Time data not found in API response' });
        }
    } catch (error) {
        console.error('DistanceMatrix error:', error.response?.data || error.message);
        return res.status(500).json({ error: 'Failed to get distance and time from Krutrim API' });
    }
};

const getAutocompleteSuggestions = async (req, res) => {
    const { input } = req.query;

    if (!input) {
        return res.status(400).json({ error: "Query parameter 'input' is required" });
    }

    try {
        const url = `https://api.olamaps.io/places/v1/autocomplete?input=${encodeURIComponent(input)}&api_key=${KRUTRIM_API_KEY}`;
        const { data } = await axios.get(url);

        if (data?.predictions?.length > 0) {
            // Extract only relevant info from predictions
            const suggestions = data.predictions.map(pred => ({
                description: pred.description,
                place_id: pred.place_id,
                main_text: pred.structured_formatting?.main_text,
                secondary_text: pred.structured_formatting?.secondary_text,
                location: pred.geometry?.location || null
            }));

            return res.json({ input, suggestions });
        } else {
            return res.status(404).json({ error: "No predictions found" });
        }
    } catch (error) {
        console.error("Autocomplete error:", error.response?.data || error.message);
        return res.status(500).json({ error: "Failed to fetch autocomplete suggestions" });
    }
};

const getCaptainsInTheRadius = async (ltd, lng, radius) => {

    const captains = await Captain.find({
        location: {
            $geoWithin: {
                $centerSphere: [[ltd, lng], radius / 6371]
            }
        }
    });

    return captains;

}




module.exports = {
    getCoordinatesFromAddress,
    getDistanceAndTime,
    getAutocompleteSuggestions,
    geocodeAddress,
    getCaptainsInTheRadius
};
