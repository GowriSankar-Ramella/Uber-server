const express = require('express');
const router = express.Router();
const { getCoordinatesFromAddress, getDistanceAndTime, getAutocompleteSuggestions } = require('../controllers/mapController');
const { authUser } = require("../middleware/auth")

router.get('/geocode', authUser, getCoordinatesFromAddress);
router.get('/distance', authUser, getDistanceAndTime);
router.get("/autocomplete", authUser, getAutocompleteSuggestions);

module.exports = router;
