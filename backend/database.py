from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# MongoDB connection string
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "appdata")
COLLECTION_NAME = os.getenv("COLLECTION_NAME", "crimedata")

# Create MongoDB client
client = AsyncIOMotorClient(MONGODB_URL)
database = client[DATABASE_NAME]
collection = database[COLLECTION_NAME]

# For synchronous operations (like seeding)
sync_client = MongoClient(MONGODB_URL)
sync_database = sync_client[DATABASE_NAME]
sync_collection = sync_database[COLLECTION_NAME]

# Dependency to get database
async def get_database():
    return database

# Dependency to get collection
async def get_collection():
    return collection
