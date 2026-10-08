from datetime import datetime

from pydantic import BaseModel


class SensorData(BaseModel):
    helmet_id: str
    temperature: float
    humidity: float

    mq4: float
    mq135: float
    mq2: float

    impact: bool = False
    battery: int

    timestamp: datetime | None = None