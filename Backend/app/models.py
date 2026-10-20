
from sqlalchemy import Boolean, Column, DateTime, Integer, Numeric, String
from sqlalchemy.sql import func

from app.database import Base


class Helmet(Base):
    __tablename__ = "helmets"

    id = Column(Integer, primary_key=True, index=True)
    helmet_id = Column(
        String(20),
        unique=True,
        nullable=False,
        index=True,
    )
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
        nullable=False,
    )

    # Environmental sensors
    temperature = Column(Numeric(5, 2))
    humidity = Column(Numeric(5, 2))

    # Gas sensors
    mq4 = Column(Numeric(10, 3))
    mq135 = Column(Numeric(10, 3))
    mq2 = Column(Numeric(10, 3))

    # ADXL345 accelerometer readings, measured in g
    accel_x = Column(Numeric(8, 3), nullable=True)
    accel_y = Column(Numeric(8, 3), nullable=True)
    accel_z = Column(Numeric(8, 3), nullable=True)

    # Impact and battery
    impact = Column(Boolean, default=False)
    battery = Column(Integer)


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    helmet_id = Column(String(20), nullable=False, index=True)
    miner_name = Column(String(100), nullable=True)
    zone = Column(String(50), nullable=True)

    incident_type = Column(String(30), nullable=False)
    severity = Column(String(20), nullable=False, default="critical")
    message = Column(String(500), nullable=False)
    status = Column(String(20), nullable=False, default="active", index=True)

    created_at = Column(
        DateTime,
        nullable=False,
        server_default=func.now(),
    )
    acknowledged_at = Column(DateTime, nullable=True)
    acknowledged_by = Column(String(100), nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    resolved_by = Column(String(100), nullable=True)
