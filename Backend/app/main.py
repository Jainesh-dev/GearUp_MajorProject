from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy.orm import Session

from app.database import Base, engine, get_db
from app.models import Helmet, SensorReading
from app.schemas import SensorData


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="GearUp Smart Mining Helmet API",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "system": "GearUp",
        "status": "online"
    }


@app.post("/api/sensors")
def receive_sensor_data(
    data: SensorData,
    db: Session = Depends(get_db)
):
    helmet = (
        db.query(Helmet)
        .filter(Helmet.helmet_id == data.helmet_id)
        .first()
    )

    if not helmet:
        raise HTTPException(
            status_code=404,
            detail=f"Helmet {data.helmet_id} not found"
        )

    reading = SensorReading(
        helmet_id=data.helmet_id,
        timestamp=data.timestamp or datetime.now(),
        temperature=data.temperature,
        humidity=data.humidity,
        mq4=data.mq4,
        mq135=data.mq135,
        mq2=data.mq2,
        impact=data.impact,
        battery=data.battery
    )

    helmet.battery = data.battery
    helmet.status = "online"
    helmet.last_seen = datetime.now()

    db.add(reading)
    db.commit()
    db.refresh(reading)

    return {
        "message": "Sensor data received",
        "helmet_id": data.helmet_id,
        "reading_id": reading.id
    }


@app.get("/api/helmets")
def get_helmets(db: Session = Depends(get_db)):
    helmets = db.query(Helmet).all()

    return helmets


@app.get("/api/helmets/{helmet_id}")
def get_helmet(
    helmet_id: str,
    db: Session = Depends(get_db)
):
    helmet = (
        db.query(Helmet)
        .filter(Helmet.helmet_id == helmet_id)
        .first()
    )

    if not helmet:
        raise HTTPException(
            status_code=404,
            detail="Helmet not found"
        )

    return helmet


@app.get("/api/helmets/{helmet_id}/readings")
def get_sensor_readings(
    helmet_id: str,
    db: Session = Depends(get_db)
):
    readings = (
        db.query(SensorReading)
        .filter(SensorReading.helmet_id == helmet_id)
        .order_by(SensorReading.timestamp.desc())
        .limit(100)
        .all()
    )

    return readings
@app.get("/api/helmets/{helmet_id}/latest")
def get_latest_reading(helmet_id: str, db: Session = Depends(get_db)):
    helmet = (
        db.query(Helmet)
        .filter(Helmet.helmet_id == helmet_id)
        .first()
    )

    if not helmet:
        raise HTTPException(
            status_code=404,
            detail="Helmet not found"
        )

    reading = (
        db.query(SensorReading)
        .filter(SensorReading.helmet_id == helmet_id)
        .order_by(SensorReading.timestamp.desc())
        .first()
    )

    if not reading:
        raise HTTPException(
            status_code=404,
            detail="No sensor readings found"
        )

    return {
        "helmet_id": helmet.helmet_id,
        "miner_name": helmet.miner_name,
        "zone": helmet.zone,
        "status": helmet.status,
        "battery": reading.battery,
        "temperature": float(reading.temperature),
        "humidity": float(reading.humidity),
        "mq4": float(reading.mq4),
        "mq135": float(reading.mq135),
        "mq2": float(reading.mq2),
        "impact": reading.impact,
        "timestamp": reading.timestamp,
    }