from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
import enum

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")
        return field_schema

class CrimeIncident(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    the_geom: Optional[str] = None
    cartodb_id: Optional[int] = None
    the_geom_webmercator: Optional[str] = None
    objectid: Optional[int] = None
    dc_dist: Optional[int] = None
    psa: Optional[int] = None
    dispatch_date_time: Optional[str] = None
    dispatch_date: Optional[datetime] = None
    dispatch_time: Optional[str] = None
    hour: Optional[int] = None
    dc_key: Optional[str] = None
    location_block: Optional[str] = None
    ucr_general: Optional[int] = None
    text_general_code: Optional[str] = None
    point_x: Optional[float] = None
    point_y: Optional[float] = None
    lat: Optional[float] = None
    lng: Optional[float] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class UserReport(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    type: str
    location: str
    use_current_location: bool = True
    photos: List[str] = []
    description: str
    severity: str
    anonymous: bool = True
    contact: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    status: str = "pending"
    user_id: Optional[str] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class UserData(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: str
    total_submissions: int = 0
    first_submission_date: Optional[datetime] = None
    last_submission_date: Optional[datetime] = None
    submission_types: dict = {}
    total_photos_submitted: int = 0
    reports_resolved: int = 0
    reports_pending: int = 0
    streak_days: int = 0
    longest_streak: int = 0
    last_activity_date: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    level: int = 1
    experience_points: int = 0
    achievements: List[str] = []
    badges: List[str] = []

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class User(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    username: str
    password_hash: str
    display_name: str
    total_contributions: int = 0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
