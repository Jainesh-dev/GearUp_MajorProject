
from datetime import datetime, timezone
from app.models import Helmet, SensorReading, Incident
from app.schemas import SensorData, SOSRequest, IncidentAction
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.database import Base, engine, get_db
from app.models import Helmet, SensorReading
from app.schemas import SensorData


# Create tables if they do not already exist.
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="GearUp Smart Mining Helmet API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ESP32 uploads approximately every 3 seconds.
# Mark the helmet offline after 15 seconds without a successful upload.
OFFLINE_TIMEOUT_SECONDS = 15


def get_helmet_status(last_seen):
    """Return online/offline based on the last successful upload."""
    if last_seen is None:
        return "offline"

    now = datetime.now(timezone.utc) if last_seen.tzinfo else datetime.now()
    elapsed = (now - last_seen).total_seconds()

    if elapsed > OFFLINE_TIMEOUT_SECONDS:
        return "offline"

    return "online"


def number_or_none(value):
    """Convert database numeric values to JSON-friendly floats."""
    return float(value) if value is not None else None


@app.get("/")
def root():
    return {
        "system": "GearUp",
        "status": "online",
    }


@app.post("/api/sensors")
def receive_sensor_data(
    data: SensorData,
    db: Session = Depends(get_db),
):
    helmet = (
        db.query(Helmet)
        .filter(Helmet.helmet_id == data.helmet_id)
        .first()
    )

    if not helmet:
        raise HTTPException(
            status_code=404,
            detail=f"Helmet {data.helmet_id} not found",
        )

    now = datetime.now()

    reading = SensorReading(
        helmet_id=data.helmet_id,
        timestamp=data.timestamp or now,
        temperature=data.temperature,
        humidity=data.humidity,
        mq4=data.mq4,
        mq135=data.mq135,
        mq2=data.mq2,
        accel_x=data.accel_x,
        accel_y=data.accel_y,
        accel_z=data.accel_z,
        impact=data.impact,
        battery=data.battery,
    )

    # Refresh heartbeat whenever the ESP32 successfully uploads data.
    helmet.status = "online"
    helmet.last_seen = now

    # Do not overwrite a known battery value with null.
    if data.battery is not None:
        helmet.battery = data.battery

    try:
        db.add(reading)
        db.commit()
        db.refresh(reading)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to save sensor data",
        )

    return {
        "message": "Sensor data received",
        "helmet_id": data.helmet_id,
        "reading_id": reading.id,
        "status": "online",
        "timestamp": reading.timestamp,
    }


@app.get("/api/helmets")
def get_helmets(db: Session = Depends(get_db)):
    helmets = db.query(Helmet).all()

    return [
        {
            "helmet_id": helmet.helmet_id,
            "miner_name": helmet.miner_name,
            "zone": helmet.zone,
            "status": get_helmet_status(helmet.last_seen),
            "battery": helmet.battery,
            "last_seen": helmet.last_seen,
        }
        for helmet in helmets
    ]


@app.get("/api/helmets/{helmet_id}")
def get_helmet(
    helmet_id: str,
    db: Session = Depends(get_db),
):
    helmet = (
        db.query(Helmet)
        .filter(Helmet.helmet_id == helmet_id)
        .first()
    )

    if not helmet:
        raise HTTPException(
            status_code=404,
            detail="Helmet not found",
        )

    return {
        "helmet_id": helmet.helmet_id,
        "miner_name": helmet.miner_name,
        "zone": helmet.zone,
        "status": get_helmet_status(helmet.last_seen),
        "battery": helmet.battery,
        "last_seen": helmet.last_seen,
    }


@app.get("/api/helmets/{helmet_id}/readings")
def get_sensor_readings(
    helmet_id: str,
    db: Session = Depends(get_db),
):
    helmet = (
        db.query(Helmet)
        .filter(Helmet.helmet_id == helmet_id)
        .first()
    )

    if not helmet:
        raise HTTPException(
            status_code=404,
            detail="Helmet not found",
        )

    readings = (
        db.query(SensorReading)
        .filter(SensorReading.helmet_id == helmet_id)
        .order_by(SensorReading.timestamp.desc())
        .limit(100)
        .all()
    )

    return [
        {
            "id": reading.id,
            "helmet_id": reading.helmet_id,
            "timestamp": reading.timestamp,
            "temperature": number_or_none(reading.temperature),
            "humidity": number_or_none(reading.humidity),
            "mq4": number_or_none(reading.mq4),
            "mq135": number_or_none(reading.mq135),
            "mq2": number_or_none(reading.mq2),
            "accel_x": number_or_none(reading.accel_x),
            "accel_y": number_or_none(reading.accel_y),
            "accel_z": number_or_none(reading.accel_z),
            "impact": reading.impact,
            "battery": reading.battery,
        }
        for reading in readings
    ]


@app.get("/api/helmets/{helmet_id}/latest")
def get_latest_reading(
    helmet_id: str,
    db: Session = Depends(get_db),
):
    helmet = (
        db.query(Helmet)
        .filter(Helmet.helmet_id == helmet_id)
        .first()
    )

    if not helmet:
        raise HTTPException(
            status_code=404,
            detail="Helmet not found",
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
            detail="No sensor readings found",
        )

    return {
        "helmet_id": helmet.helmet_id,
        "miner_name": helmet.miner_name,
        "zone": helmet.zone,
        "status": get_helmet_status(helmet.last_seen),
        "last_seen": helmet.last_seen,
        "battery": number_or_none(reading.battery),
        "temperature": number_or_none(reading.temperature),
        "humidity": number_or_none(reading.humidity),
        "mq4": number_or_none(reading.mq4),
        "mq135": number_or_none(reading.mq135),
        "mq2": number_or_none(reading.mq2),
        "accel_x": number_or_none(reading.accel_x),
        "accel_y": number_or_none(reading.accel_y),
        "accel_z": number_or_none(reading.accel_z),
        "impact": reading.impact,
        "timestamp": reading.timestamp,
    }


@app.get("/api/dashboard/overview")
def dashboard_overview(db: Session = Depends(get_db)):
    all_helmets = db.query(Helmet).all()

    active_incidents = (
        db.query(Incident)
        .filter(Incident.status.in_(["active", "acknowledged"]))
        .order_by(Incident.created_at.desc())
        .all()
    )

    online_count = sum(
        1 for helmet in all_helmets
        if get_helmet_status(helmet.last_seen) == "online"
    )

    return {
        "total_helmets": len(all_helmets),
        "online": online_count,
        "offline": len(all_helmets) - online_count,
        "active_incidents": len(active_incidents),
        "critical_incidents": sum(
            1 for incident in active_incidents
            if incident.severity == "critical"
        ),
        "helmets": [
            {
                "helmet_id": helmet.helmet_id,
                "miner_name": helmet.miner_name,
                "zone": helmet.zone,
                "status": get_helmet_status(helmet.last_seen),
                "battery": helmet.battery,
                "last_seen": helmet.last_seen,
            }
            for helmet in all_helmets
        ],
    }


@app.post("/api/incidents/sos", status_code=201)
def create_sos(
    data: SOSRequest,
    db: Session = Depends(get_db),
):
    helmet = (
        db.query(Helmet)
        .filter(Helmet.helmet_id == data.helmet_id)
        .first()
    )

    if not helmet:
        raise HTTPException(status_code=404, detail="Helmet not found")

    # Avoid duplicate active SOS records for the same helmet.
    existing = (
        db.query(Incident)
        .filter(
            Incident.helmet_id == data.helmet_id,
            Incident.incident_type == "SOS",
            Incident.status.in_(["active", "acknowledged"]),
        )
        .first()
    )

    if existing:
        return {
            "message": "An active SOS already exists",
            "incident_id": existing.id,
            "status": existing.status,
        }

    incident = Incident(
        helmet_id=helmet.helmet_id,
        miner_name=helmet.miner_name,
        zone=helmet.zone,
        incident_type="SOS",
        severity="critical",
        message=data.message,
        status="active",
    )

    try:
        db.add(incident)
        db.commit()
        db.refresh(incident)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to save SOS incident",
        )

    return {
        "message": "SOS incident created",
        "incident_id": incident.id,
        "helmet_id": incident.helmet_id,
        "status": incident.status,
        "created_at": incident.created_at,
    }


@app.get("/api/incidents")
def list_incidents(
    active_only: bool = False,
    db: Session = Depends(get_db),
):
    query = db.query(Incident)

    if active_only:
        query = query.filter(
            Incident.status.in_(["active", "acknowledged"])
        )

    incidents = query.order_by(Incident.created_at.desc()).limit(200).all()

    return [
        {
            "id": incident.id,
            "helmet_id": incident.helmet_id,
            "miner_name": incident.miner_name,
            "zone": incident.zone,
            "incident_type": incident.incident_type,
            "severity": incident.severity,
            "message": incident.message,
            "status": incident.status,
            "created_at": incident.created_at,
            "acknowledged_at": incident.acknowledged_at,
            "acknowledged_by": incident.acknowledged_by,
            "resolved_at": incident.resolved_at,
            "resolved_by": incident.resolved_by,
        }
        for incident in incidents
    ]


@app.post("/api/incidents/{incident_id}/acknowledge")
def acknowledge_incident(
    incident_id: int,
    data: IncidentAction,
    db: Session = Depends(get_db),
):
    incident = db.query(Incident).filter(
        Incident.id == incident_id
    ).first()

    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    if incident.status == "resolved":
        raise HTTPException(
            status_code=409,
            detail="Resolved incidents cannot be acknowledged again",
        )

    if incident.status == "active":
        incident.status = "acknowledged"
        incident.acknowledged_at = datetime.now()
        incident.acknowledged_by = data.actor
        db.commit()
        db.refresh(incident)

    return {
        "message": "Incident acknowledged",
        "incident_id": incident.id,
        "status": incident.status,
    }


@app.post("/api/incidents/{incident_id}/resolve")
def resolve_incident(
    incident_id: int,
    data: IncidentAction,
    db: Session = Depends(get_db),
):
    incident = db.query(Incident).filter(
        Incident.id == incident_id
    ).first()

    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    if incident.status != "resolved":
        incident.status = "resolved"
        incident.resolved_at = datetime.now()
        incident.resolved_by = data.actor
        db.commit()
        db.refresh(incident)

    return {
        "message": "Incident resolved",
        "incident_id": incident.id,
        "status": incident.status,
    }
