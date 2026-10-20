
from datetime import datetime
from pydantic import BaseModel, Field
from pydantic import BaseModel


class SensorData(BaseModel):
    helmet_id: str

    # DHT11
    temperature: float
    humidity: float

    # Gas sensors: None means not connected or unavailable
    mq4: float | None = None
    mq135: float | None = None
    mq2: float | None = None

    # ADXL345 accelerometer readings, measured in g
    accel_x: float | None = None
    accel_y: float | None = None
    accel_z: float | None = None

    # Impact detection
    impact: bool = False

    # Battery monitoring: None until measured
    battery: int | None = None

    # Optional sensor timestamp
    timestamp: datetime | None = None

class SOSRequest(BaseModel):
    helmet_id: str = Field(min_length=1, max_length=20)
    message: str = Field(
        default="Emergency SOS triggered",
        min_length=1,
        max_length=500,
    )


class IncidentAction(BaseModel):
    actor: str = Field(min_length=1, max_length=100)