# PhillySafe - Philadelphia Crime Reporting App

A React Native app with FastAPI backend for reporting and visualizing crime incidents in Philadelphia.

## Project Structure

```
PhillySafeRN/
├── frontend/          # React Native/Expo frontend
│   ├── src/          # Source code
│   ├── assets/       # Images and static files
│   ├── App.tsx       # Main app component
│   ├── package.json  # Frontend dependencies
│   └── ...
├── backend/          # FastAPI backend
│   ├── main.py       # FastAPI application
│   ├── models.py     # Pydantic models
│   ├── schemas.py    # Request/response schemas
│   ├── database.py   # MongoDB connection
│   ├── requirements.txt # Backend dependencies
│   └── .env          # Environment variables
└── README.md         # This file
```

## Quick Start

### Backend Setup
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
./run.sh
```

### Frontend Setup
```bash
cd frontend
npm install
npx expo start
```

## Features

- **Crime Heatmap**: Interactive map with tap tooltips showing incident details
- **Report System**: Submit crime reports with photos and location
- **User Authentication**: Login/register system with secure password hashing
- **Leaderboard**: User rankings based on report submissions
- **Status System**: Dynamic user status levels (Newbie Helper → Mythic Ally)
- **Real-time Data**: MongoDB integration with live crime data

## Tech Stack

### Frontend
- React Native with Expo
- TypeScript
- React Navigation
- AsyncStorage for authentication
- WebView for interactive maps

### Backend
- FastAPI
- MongoDB with Motor (async driver)
- Pydantic for data validation
- bcrypt for password hashing
- CORS enabled for cross-origin requests

## API Endpoints

- `GET /crime` - Get all crime incidents
- `POST /reports` - Submit user report
- `GET /userdata/leaderboard` - Get user rankings
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login

## Environment Variables

### Backend (.env)
```
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=appdata
COLLECTION_NAME=crimedata
```

## Development

The app uses a WebView-based map with Google Maps and Deck.gl for the heatmap visualization. Tap tooltips show incident details within a 200m radius of the tap location.

## License

© 2025 PhillySafe - Built with ❤️ for Philadelphia
