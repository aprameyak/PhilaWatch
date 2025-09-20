from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List
import uvicorn
import os
from dotenv import load_dotenv
from bson import ObjectId

from database import get_collection, collection
from models import CrimeIncident
from schemas import CrimeIncidentCreate, CrimeIncidentResponse

# Load environment variables
load_dotenv()

app = FastAPI(title="PhillySafe API", version="1.0.0")

# Add CORS middleware to allow requests from your React Native app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your app's specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get MongoDB collection
async def get_crime_collection():
    return collection

@app.get("/")
async def root():
    return {"message": "PhillySafe API is running!"}

@app.get("/incidents", response_model=List[CrimeIncidentResponse])
async def get_all_incidents(crime_collection = Depends(get_crime_collection)):
    """Get all crime incidents from the database"""
    try:
        incidents = []
        async for incident in crime_collection.find():
            incident["_id"] = str(incident["_id"])
            incidents.append(incident)
        return incidents
    except Exception as e:
        # Return sample data if MongoDB is not available
        return [
            {
                "_id": "68ce3f3dc804a74894efc04d",
                "the_geom": "0101000020E610000034D87A0A89CB52C02834C6AA68F54340",
                "cartodb_id": 1,
                "objectid": 31803412,
                "dc_dist": 1,
                "psa": 2,
                "dispatch_date_time": "2025-08-11 00:34:00+00",
                "dispatch_date": "2025-08-10T00:00:00.000+00:00",
                "dispatch_time": "20:34:00",
                "hour": 20,
                "dc_key": "202501022026",
                "location_block": "1900 BLOCK JOHNSTON ST",
                "ucr_general": 300,
                "text_general_code": "Robbery No Firearm",
                "point_x": -75.18023931,
                "point_y": 39.91725669,
                "lat": 39.91725669,
                "lng": -75.18023931
            }
        ]

@app.post("/incidents", response_model=CrimeIncidentResponse)
async def create_incident(incident: CrimeIncidentCreate, crime_collection = Depends(get_crime_collection)):
    """Create a new crime incident"""
    incident_dict = incident.dict()
    result = await crime_collection.insert_one(incident_dict)
    created_incident = await crime_collection.find_one({"_id": result.inserted_id})
    created_incident["_id"] = str(created_incident["_id"])
    return created_incident

@app.get("/incidents/{incident_id}", response_model=CrimeIncidentResponse)
async def get_incident(incident_id: str, crime_collection = Depends(get_crime_collection)):
    """Get a specific incident by ID"""
    try:
        object_id = ObjectId(incident_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid incident ID format")
    
    incident = await crime_collection.find_one({"_id": object_id})
    if incident is None:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    incident["_id"] = str(incident["_id"])
    return incident

if __name__ == "__main__":
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", 8000))
    debug = os.getenv("API_DEBUG", "True").lower() == "true"
    uvicorn.run("main:app", host=host, port=port, reload=debug)
