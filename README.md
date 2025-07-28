# Uber Backend Server

A comprehensive Node.js backend application for an Uber-like ride-sharing platform with real-time communication, geolocation services, and complete ride management system.

## 🚀 Features

- **User Authentication**: JWT-based authentication for users and captains
- **Real-time Communication**: Socket.io integration for live updates
- **Geolocation Services**: Integration with OLA Maps API for geocoding and distance calculations
- **Ride Management**: Complete ride lifecycle from creation to completion
- **Captain Management**: Driver registration and ride assignment
- **Location Tracking**: Real-time captain location updates

## 📁 Project Structure

```
Uber-server/
├── src/
│   ├── app.js                    # Express app configuration
│   ├── index.js                  # Server entry point
│   ├── config/
│   │   └── db.config.js          # Database connection
│   ├── controllers/
│   │   ├── captainControllers.js # Captain-related operations
│   │   ├── mapController.js      # Map and geolocation services
│   │   ├── rideController.js     # Ride management
│   │   └── userControllers.js    # User operations
│   ├── middleware/
│   │   └── auth.js               # Authentication middleware
│   ├── models/
│   │   ├── captain.model.js      # Captain data schema
│   │   ├── ride.model.js         # Ride data schema
│   │   └── user.model.js         # User data schema
│   ├── routes/
│   │   ├── captainRoutes.js      # Captain endpoints
│   │   ├── mapRoutes.js          # Map service endpoints
│   │   ├── rideRoutes.js         # Ride management endpoints
│   │   └── userRoutes.js         # User endpoints
│   └── utils/
│       ├── socket.js             # Socket.io configuration
│       ├── validateCaptainData.js # Captain data validation
│       └── validateData.js       # User data validation
├── package.json
└── .env                          # Environment variables
```

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.io
- **Maps API**: OLA Maps (Krutrim)
- **Validation**: Validator.js
- **Security**: bcrypt for password hashing

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB database
- OLA Maps API key

## ⚙️ Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Uber-server
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:

   ```env
   DB_URI=mongodb://localhost:27017/uber
   JWT_SECRET=your_jwt_secret_key
   KRUTRIM_MAPS_API_KEY=your_ola_maps_api_key
   ```

4. **Start the server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3000`

## 🔗 API Endpoints

### User Routes (`/user`)

- `POST /signup` - User registration
- `POST /login` - User login
- `GET /logout` - User logout (protected)
- `GET /profile` - Get user profile (protected)

### Captain Routes (`/captain`)

- `POST /signup` - Captain registration
- `POST /login` - Captain login
- `GET /logout` - Captain logout (protected)
- `GET /profile` - Get captain profile (protected)

### Ride Routes (`/ride`)

- `POST /create` - Create a new ride (user)
- `GET /get-fare` - Calculate fare estimates (user)
- `POST /confirm` - Confirm ride acceptance (captain)
- `GET /start-ride` - Start ride with OTP (captain)
- `POST /end-ride` - Complete ride (captain)

### Map Routes (`/map`)

- `GET /geocode` - Get coordinates from address
- `GET /distance` - Calculate distance and time between locations
- `GET /autocomplete` - Get address suggestions

## 📊 Database Models

### User Model

```javascript
{
  firstName: String (required),
  lastName: String,
  email: String (required, unique),
  password: String (required, hashed),
  socketId: String
}
```

### Captain Model

```javascript
{
  firstName: String (required),
  lastName: String,
  email: String (required, unique),
  password: String (required, hashed),
  socketId: String,
  status: Enum ['active', 'inactive'],
  vehicle: {
    color: String (required),
    plate: String (required),
    capacity: Number (required),
    vehicleType: Enum ['car', 'moto', 'auto']
  },
  location: {
    ltd: Number,
    lng: Number
  }
}
```

### Ride Model

```javascript
{
  user: ObjectId (ref: User),
  captain: ObjectId (ref: Captain),
  pickup: String (required),
  destination: String (required),
  fare: Number (required),
  status: Enum ['pending', 'accepted', 'ongoing', 'completed', 'cancelled'],
  duration: Number, // in minutes
  distance: Number, // in km
  otp: String (required, hidden),
  vehicleType: Enum ['car', 'moto', 'auto']
}
```

## 🔌 Real-time Events

### Socket Events

- `join` - User/Captain joins with userId and userType
- `update-location-captain` - Captain location updates
- `new-ride` - Broadcast new ride to nearby captains
- `ride-confirmed` - Notify user when captain accepts ride
- `ride-started` - Notify user when ride begins
- `ride-ended` - Notify user when ride completes

## 🛡️ Authentication

The application uses JWT tokens stored in HTTP-only cookies for authentication. Protected routes require valid tokens and use middleware to verify user/captain identity.

### Middleware

- `authUser` - Validates user authentication
- `authCaptain` - Validates captain authentication

## 🗺️ Geolocation Features

- **Geocoding**: Convert addresses to coordinates
- **Distance Calculation**: Calculate distance and time between locations
- **Autocomplete**: Address suggestion service
- **Captain Radius Search**: Find captains within specified radius

## 💰 Fare Calculation

Dynamic fare calculation based on:

- **Base Fare**: Fixed starting amount per vehicle type
- **Distance**: Rate per kilometer
- **Duration**: Rate per minute

Vehicle Types:

- **Car**: Base ₹10, ₹5/km, ₹1.5/min
- **Auto**: Base ₹10, ₹3/km, ₹1/min
- **Moto**: Base ₹5, ₹2/km, ₹0.8/min

## 🔄 Ride Flow

1. **User creates ride** → System calculates fare and generates OTP
2. **Nearby captains receive notification** → Captain can accept/ignore
3. **Captain accepts ride** → User gets confirmation with captain details
4. **Captain starts ride** → Validates OTP and begins journey
5. **Captain ends ride** → Ride marked as completed, user notified

## 🚦 Getting Started

1. Start MongoDB service
2. Set up environment variables
3. Run `npm run dev`
4. Test endpoints using Postman or integrate with frontend

## 📝 Dependencies

```json
{
  "axios": "^1.10.0",
  "bcrypt": "^6.0.0",
  "cookie-parser": "^1.4.7",
  "cors": "^2.8.5",
  "dotenv": "^17.0.1",
  "express": "^5.1.0",
  "jsonwebtoken": "^9.0.2",
  "mongoose": "^8.16.1",
  "socket.io": "^4.8.1",
  "validator": "^13.15.15"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create Pull Request

## 📄 License

This project is licensed under the ISC License.

---

**Note**: This backend is designed to work with the Uber-Web frontend application and requires proper environment configuration for
