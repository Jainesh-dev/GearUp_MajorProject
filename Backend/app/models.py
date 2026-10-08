from sqlalchemy import Boolean, Column, DateTime, Integer, Numeric, String
from sqlalchemy.sql import func
from app.database import Base


class Helmet(Base):
    __tablename__ = "helmets"

    id = Column(Integer, primary_key=True, index=True)
    helmet_id = Column(String(20), unique=True, nullable=False, index=True)
    miner_name = Column(String(100))
    zone = Column(String(50))
    status = Column(String(20), default="offline")
    battery = Column(Integer)
    last_seen = Column(DateTime)


class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, index=True)
    helmet_id = Column(String(20), nullable=False, index=True)

    timestamp = Column(
        DateTime,
        server_default=func.now(),
        nullable=False
    )

    temperature = Column(Numeric(5, 2))
    humidity = Column(Numeric(5, 2))

    mq4 = Column(Numeric(10, 3))
    mq135 = Column(Numeric(10, 3))
    mq2 = Column(Numeric(10, 3))

    impact = Column(Boolean, default=False)
    battery = Column(Integer)