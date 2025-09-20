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
