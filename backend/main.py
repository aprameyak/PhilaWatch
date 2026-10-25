from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List
import uvicorn
import os
from dotenv import load_dotenv
from bson import ObjectId
from datetime import datetime, timedelta
import bcrypt

from database import get_collection, collection, get_user_reports_collection, user_reports_collection, get_user_data_collection, user_data_collection, get_users_collection, users_collection
from models import CrimeIncident, UserReport, UserData, User
from schemas import CrimeIncidentCreate, CrimeIncidentResponse, UserReportCreate, UserReportResponse, UserDataCreate, UserDataResponse, UserDataUpdate, UserRegister, UserLogin, UserResponse

load_dotenv()

app = FastAPI(title="PhilaWatch API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def get_crime_collection():
    return collection

async def get_reports_collection():
    return user_reports_collection

async def get_user_data_collection_dep():
    return user_data_collection

async def get_users_collection_dep():
    return users_collection

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

@app.get("/")
async def root():
    return {"message": "PhilaWatch API is running!"}

@app.get("/crime", response_model=List[CrimeIncidentResponse])
async def get_all_crime(crime_collection = Depends(get_crime_collection)):
    incidents = []
    async for incident in crime_collection.find():
        incident["_id"] = str(incident["_id"])
        incidents.append(CrimeIncidentResponse(**incident))
    return incidents

@app.post("/crime", response_model=CrimeIncidentResponse)
async def create_crime(incident: CrimeIncidentCreate, crime_collection = Depends(get_crime_collection)):
    incident_dict = incident.dict()
    result = await crime_collection.insert_one(incident_dict)
    created_incident = await crime_collection.find_one({"_id": result.inserted_id})
    created_incident["_id"] = str(created_incident["_id"])
    return created_incident

@app.get("/crime/{incident_id}", response_model=CrimeIncidentResponse)
async def get_crime(incident_id: str, crime_collection = Depends(get_crime_collection)):
    try:
        object_id = ObjectId(incident_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid incident ID format")
    
    incident = await crime_collection.find_one({"_id": object_id})
    if incident is None:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    incident["_id"] = str(incident["_id"])
    return incident

@app.get("/reports", response_model=List[UserReportResponse])
async def get_all_reports(reports_collection = Depends(get_reports_collection)):
    reports = []
    async for report in reports_collection.find():
        report["_id"] = str(report["_id"])
        reports.append(report)
    return reports

@app.post("/reports", response_model=UserReportResponse)
async def create_report(report: UserReportCreate, reports_collection = Depends(get_reports_collection), user_data_collection = Depends(get_user_data_collection_dep)):
    report_dict = report.dict()
    from datetime import datetime
    report_dict["timestamp"] = datetime.utcnow()
    report_dict["status"] = "pending"
    
    result = await reports_collection.insert_one(report_dict)
    created_report = await reports_collection.find_one({"_id": result.inserted_id})
    created_report["_id"] = str(created_report["_id"])
    
    user_id = report_dict.get("user_id") or "anonymous_user"
    await update_user_stats_on_submission(user_id, report_dict, user_data_collection)
    
    return created_report

@app.get("/reports/{report_id}", response_model=UserReportResponse)
async def get_report(report_id: str, reports_collection = Depends(get_reports_collection)):
    try:
        object_id = ObjectId(report_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid report ID format")
    
    report = await reports_collection.find_one({"_id": object_id})
    if report is None:
        raise HTTPException(status_code=404, detail="Report not found")
    
    report["_id"] = str(report["_id"])
    return report

@app.put("/reports/{report_id}/status", response_model=UserReportResponse)
async def update_report_status(
    report_id: str, 
    status: str, 
    reports_collection = Depends(get_reports_collection)
):
    if status not in ["pending", "reviewed", "resolved"]:
        raise HTTPException(status_code=400, detail="Invalid status. Must be 'pending', 'reviewed', or 'resolved'")
    
    try:
        object_id = ObjectId(report_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid report ID format")
    
    result = await reports_collection.update_one(
        {"_id": object_id}, 
        {"$set": {"status": status}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Report not found")
    
    updated_report = await reports_collection.find_one({"_id": object_id})
    updated_report["_id"] = str(updated_report["_id"])
    return updated_report

@app.get("/userdata/leaderboard", response_model=List[UserDataResponse])
async def get_leaderboard(user_data_collection = Depends(get_user_data_collection_dep)):
    user_data_list = []
    documents = await user_data_collection.find().sort("total_submissions", -1).to_list(length=None)
    for user_data in documents:
        user_data["_id"] = str(user_data["_id"])
        user_data_list.append(user_data)
    return user_data_list

@app.get("/userdata/{user_id}", response_model=UserDataResponse)
async def get_user_data(user_id: str, user_data_collection = Depends(get_user_data_collection_dep)):
    user_data = await user_data_collection.find_one({"user_id": user_id})
    if user_data is None:
        new_user_data = {
            "user_id": user_id,
            "total_submissions": 0,
            "submission_types": {},
            "total_photos_submitted": 0,
            "reports_resolved": 0,
            "reports_pending": 0,
            "streak_days": 0,
            "longest_streak": 0,
            "level": 1,
            "experience_points": 0,
            "achievements": [],
            "badges": [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        result = await user_data_collection.insert_one(new_user_data)
        user_data = await user_data_collection.find_one({"_id": result.inserted_id})
    
    user_data["_id"] = str(user_data["_id"])
    return user_data

@app.post("/userdata", response_model=UserDataResponse)
async def create_user_data(user_data: UserDataCreate, user_data_collection = Depends(get_user_data_collection_dep)):
    user_data_dict = user_data.dict()
    user_data_dict["created_at"] = datetime.utcnow()
    user_data_dict["updated_at"] = datetime.utcnow()
    
    result = await user_data_collection.insert_one(user_data_dict)
    created_user_data = await user_data_collection.find_one({"_id": result.inserted_id})
    created_user_data["_id"] = str(created_user_data["_id"])
    return created_user_data

@app.put("/userdata/{user_id}", response_model=UserDataResponse)
async def update_user_data(
    user_id: str, 
    user_data_update: UserDataUpdate, 
    user_data_collection = Depends(get_user_data_collection_dep)
):
    update_dict = {k: v for k, v in user_data_update.dict().items() if v is not None}
    update_dict["updated_at"] = datetime.utcnow()
    
    result = await user_data_collection.update_one(
        {"user_id": user_id}, 
        {"$set": update_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User data not found")
    
    updated_user_data = await user_data_collection.find_one({"user_id": user_id})
    updated_user_data["_id"] = str(updated_user_data["_id"])
    return updated_user_data

@app.delete("/userdata/{user_id}")
async def delete_user_data(user_id: str, user_data_collection = Depends(get_user_data_collection_dep)):
    result = await user_data_collection.delete_one({"user_id": user_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User data not found")
    
    return {"message": "User data deleted successfully"}


async def update_user_stats_on_submission(user_id: str, report_data: dict, user_data_collection):
    
    user_data = await user_data_collection.find_one({"user_id": user_id})
    if not user_data:
        user_data = {
            "user_id": user_id,
            "total_submissions": 0,
            "submission_types": {},
            "total_photos_submitted": 0,
            "reports_resolved": 0,
            "reports_pending": 0,
            "streak_days": 0,
            "longest_streak": 0,
            "level": 1,
            "experience_points": 0,
            "achievements": [],
            "badges": [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        await user_data_collection.insert_one(user_data)
        user_data = await user_data_collection.find_one({"user_id": user_id})
    
    current_time = datetime.utcnow()
    updates = {
        "total_submissions": user_data.get("total_submissions", 0) + 1,
        "last_submission_date": current_time,
        "last_activity_date": current_time,
        "total_photos_submitted": user_data.get("total_photos_submitted", 0) + len(report_data.get("photos", [])),
        "reports_pending": user_data.get("reports_pending", 0) + 1,
        "updated_at": current_time
    }
    
    submission_type = report_data.get("type", "unknown")
    submission_types = user_data.get("submission_types", {})
    submission_types[submission_type] = submission_types.get(submission_type, 0) + 1
    updates["submission_types"] = submission_types
    
    last_submission = user_data.get("last_submission_date")
    if last_submission:
        days_diff = (current_time - last_submission).days
        if days_diff == 1:
            updates["streak_days"] = user_data.get("streak_days", 0) + 1
        elif days_diff > 1:
            updates["streak_days"] = 1
        else:
            updates["streak_days"] = user_data.get("streak_days", 0)
    else:
        updates["streak_days"] = 1
        updates["first_submission_date"] = current_time
    
    current_streak = updates["streak_days"]
    longest_streak = user_data.get("longest_streak", 0)
    if current_streak > longest_streak:
        updates["longest_streak"] = current_streak
    else:
        updates["longest_streak"] = longest_streak
    
    xp_gained = 10
    if len(report_data.get("photos", [])) > 0:
        xp_gained += 5
    if report_data.get("severity") == "high":
        xp_gained += 5
    
    new_xp = user_data.get("experience_points", 0) + xp_gained
    updates["experience_points"] = new_xp
    
    new_level = (new_xp // 100) + 1
    updates["level"] = new_level
    
    achievements = user_data.get("achievements", [])
    new_achievements = []
    
    if updates["total_submissions"] == 1 and "first_report" not in achievements:
        new_achievements.append("first_report")
    if updates["total_submissions"] == 10 and "reporter_10" not in achievements:
        new_achievements.append("reporter_10")
    if updates["total_submissions"] == 50 and "reporter_50" not in achievements:
        new_achievements.append("reporter_50")
    if updates["streak_days"] == 7 and "streak_7" not in achievements:
        new_achievements.append("streak_7")
    if updates["streak_days"] == 30 and "streak_30" not in achievements:
        new_achievements.append("streak_30")
    if updates["total_photos_submitted"] >= 10 and "photographer" not in achievements:
        new_achievements.append("photographer")
    
    if new_achievements:
        achievements.extend(new_achievements)
        updates["achievements"] = achievements
    
    await user_data_collection.update_one(
        {"user_id": user_id},
        {"$set": updates}
    )
    
    return updates

@app.post("/auth/register", response_model=UserResponse)
async def register_user(user_data: UserRegister, users_collection = Depends(get_users_collection_dep)):
    existing_user = await users_collection.find_one({"username": user_data.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    password_hash = hash_password(user_data.password)
    
    new_user = {
        "username": user_data.username,
        "password_hash": password_hash,
        "display_name": user_data.display_name,
        "total_contributions": 0,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await users_collection.insert_one(new_user)
    created_user = await users_collection.find_one({"_id": result.inserted_id})
    created_user["_id"] = str(created_user["_id"])
    
    del created_user["password_hash"]
    return created_user

@app.post("/auth/login", response_model=UserResponse)
async def login_user(login_data: UserLogin, users_collection = Depends(get_users_collection_dep)):
    user = await users_collection.find_one({"username": login_data.username})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    if not verify_password(login_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    user["_id"] = str(user["_id"])
    del user["password_hash"]
    return user

@app.get("/auth/users/{username}", response_model=UserResponse)
async def get_user_by_username(username: str, users_collection = Depends(get_users_collection_dep)):
    user = await users_collection.find_one({"username": username})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user["_id"] = str(user["_id"])
    del user["password_hash"]
    return user

@app.put("/auth/users/{username}/contributions")
async def update_user_contributions(
    username: str, 
    contributions: int, 
    users_collection = Depends(get_users_collection_dep)
):
    result = await users_collection.update_one(
        {"username": username},
        {"$set": {"total_contributions": contributions, "updated_at": datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "Contributions updated successfully"}

if __name__ == "__main__":
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", 8000))
    debug = os.getenv("API_DEBUG", "True").lower() == "true"
    uvicorn.run("main:app", host=host, port=port, reload=debug)
