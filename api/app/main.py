import os
import logging
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uuid
import random

from .models import Incident, Event
from .repo import IncidentRepository
from .detection import DetectionEngine
from .alerts import AlertManager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="SentinelOne Lite",
    description="Lightweight cybersecurity monitoring MVP",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost", "http://127.0.0.1"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components
database_url = os.getenv("DATABASE_URL", "postgresql+psycopg2://postgres:postgres@db:5432/s1lite")
incident_repo = IncidentRepository(database_url)
alert_manager = AlertManager()
detection_engine = DetectionEngine(incident_repo, alert_manager)

# Pydantic models for API
class EventCreate(BaseModel):
    ts: str
    ip: str
    category: str
    port: int = None
    raw: str = None

class IncidentResponse(BaseModel):
    id: str
    created_at: datetime
    ip: str
    type: str
    count: int
    severity: str
    meta: Dict[str, Any]

class StatsResponse(BaseModel):
    today_count: int
    by_type: Dict[str, int]
    timeseries: List[Dict[str, Any]]

class HealthResponse(BaseModel):
    status: str
    timestamp: datetime
    database: str

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    try:
        # Test database connection
        incidents = incident_repo.get_incidents(limit=1)
        db_status = "connected"
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        db_status = "disconnected"
    
    return HealthResponse(
        status="ok",
        timestamp=datetime.now(timezone.utc),
        database=db_status
    )

@app.get("/incidents", response_model=List[IncidentResponse])
async def get_incidents(limit: int = 50):
    """Get latest incidents"""
    try:
        incidents = incident_repo.get_incidents(limit=limit)
        return [
            IncidentResponse(
                id=str(incident.id),
                created_at=incident.created_at,
                ip=incident.ip,
                type=incident.type,
                count=incident.count,
                severity=incident.severity,
                meta=incident.meta or {}
            )
            for incident in incidents
        ]
    except Exception as e:
        logger.error(f"Error fetching incidents: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/stats/daily", response_model=StatsResponse)
async def get_daily_stats():
    """Get daily statistics for dashboard"""
    try:
        stats = incident_repo.get_daily_stats()
        return StatsResponse(**stats)
    except Exception as e:
        logger.error(f"Error fetching daily stats: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/test-event")
async def generate_test_event(background_tasks: BackgroundTasks):
    """Generate synthetic test events that will trigger detections"""
    try:
        # Generate brute force attack events
        brute_force_ip = "203.0.113.7"
        auth_fail_events = []
        
        # Create 12 AUTH_FAIL events over 4 minutes (will trigger brute force detection)
        for i in range(12):
            timestamp = datetime.now(timezone.utc) - timedelta(minutes=4-i*0.3)  # Spread over 4 minutes
            event = Event(
                ts=timestamp,
                ip=brute_force_ip,
                category="AUTH_FAIL",
                port=22,
                raw=f"Failed login attempt {i+1}"
            )
            auth_fail_events.append(event)
            incident_repo.create_event(event)
        
        # Generate port scan events
        port_scan_ip = "198.51.100.9"
        port_scan_events = []
        
        # Common ports to scan
        common_ports = [21, 22, 23, 25, 53, 80, 110, 143, 443, 993, 995, 3306, 5432, 8080, 8443, 9000, 27017, 6379, 11211, 9200]
        
        # Create 20 CONN_ATTEMPT events over 2.5 minutes (will trigger port scan detection)
        for i, port in enumerate(common_ports):
            timestamp = datetime.now(timezone.utc) - timedelta(minutes=2.5-i*0.15)  # Spread over 2.5 minutes
            event = Event(
                ts=timestamp,
                ip=port_scan_ip,
                category="CONN_ATTEMPT",
                port=port,
                raw=f"Connection attempt to port {port}"
            )
            port_scan_events.append(event)
            incident_repo.create_event(event)
        
        # Process events through detection engine
        background_tasks.add_task(process_test_events, auth_fail_events + port_scan_events)
        
        return {
            "message": "Test events generated successfully",
            "events_created": len(auth_fail_events) + len(port_scan_events),
            "brute_force_ip": brute_force_ip,
            "port_scan_ip": port_scan_ip,
            "expected_incidents": [
                {"type": "BRUTE_FORCE", "severity": "MEDIUM", "ip": brute_force_ip},
                {"type": "PORT_SCAN", "severity": "HIGH", "ip": port_scan_ip}
            ]
        }
        
    except Exception as e:
        logger.error(f"Error generating test events: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

async def process_test_events(events: List[Event]):
    """Process test events through detection engine"""
    try:
        for event in events:
            detection_engine.process_event(event)
        
        # Clean up old data
        detection_engine.cleanup_old_data()
        
        logger.info(f"Processed {len(events)} test events through detection engine")
        
    except Exception as e:
        logger.error(f"Error processing test events: {e}")

@app.on_event("startup")
async def startup_event():
    """Initialize components on startup"""
    logger.info("Starting SentinelOne Lite API")
    
    # Test database connection
    try:
        incidents = incident_repo.get_incidents(limit=1)
        logger.info("Database connection established")
    except Exception as e:
        logger.error(f"Failed to connect to database: {e}")
        raise

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Shutting down SentinelOne Lite API")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
