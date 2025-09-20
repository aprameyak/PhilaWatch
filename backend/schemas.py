from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId

class CrimeIncidentBase(BaseModel):
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

class CrimeIncidentCreate(CrimeIncidentBase):
    pass

class CrimeIncidentResponse(CrimeIncidentBase):
    id: str = Field(alias="_id")

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}
