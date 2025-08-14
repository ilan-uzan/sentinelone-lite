from typing import List, Optional, Dict, Any
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.exc import SQLAlchemyError
import logging
from .models import Base, Incident, Event
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class IncidentRepository:
    def __init__(self, database_url: str):
        self.engine = create_engine(database_url)
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        self._create_tables()
    
    def _create_tables(self):
        """Create tables if they don't exist"""
        try:
            Base.metadata.create_all(bind=self.engine)
            logger.info("Database tables created/verified")
        except Exception as e:
            logger.error(f"Error creating tables: {e}")
    
    def get_db(self) -> Session:
        """Get database session"""
        return self.SessionLocal()
    
    def create_incident(self, incident: Incident) -> Incident:
        """Create a new incident"""
        db = self.get_db()
        try:
            db.add(incident)
            db.commit()
            db.refresh(incident)
            return incident
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(f"Error creating incident: {e}")
            raise
        finally:
            db.close()
    
    def create_event(self, event: Event) -> Event:
        """Create a new event"""
        db = self.get_db()
        try:
            db.add(event)
            db.commit()
            db.refresh(event)
            return event
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(f"Error creating event: {e}")
            raise
        finally:
            db.close()
    
    def get_incidents(self, limit: int = 50) -> List[Incident]:
        """Get latest incidents"""
        db = self.get_db()
        try:
            incidents = db.query(Incident).order_by(Incident.created_at.desc()).limit(limit).all()
            return incidents
        except SQLAlchemyError as e:
            logger.error(f"Error fetching incidents: {e}")
            return []
        finally:
            db.close()
    
    def get_recent_incident(self, ip: str, incident_type: str, 
                           within_minutes: int = 10) -> Optional[Incident]:
        """Check if incident already exists for IP and type within time window"""
        db = self.get_db()
        try:
            cutoff = datetime.now(datetime.timezone.utc) - timedelta(minutes=within_minutes)
            incident = db.query(Incident).filter(
                Incident.ip == ip,
                Incident.type == incident_type,
                Incident.created_at >= cutoff
            ).first()
            return incident
        except SQLAlchemyError as e:
            logger.error(f"Error checking recent incident: {e}")
            return None
        finally:
            db.close()
    
    def get_daily_stats(self) -> Dict[str, Any]:
        """Get daily statistics for dashboard"""
        db = self.get_db()
        try:
            # Today's count
            today_start = datetime.now(datetime.timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
            today_count = db.query(Incident).filter(
                Incident.created_at >= today_start
            ).count()
            
            # Breakdown by type
            by_type = {}
            type_counts = db.query(Incident.type, db.func.count(Incident.id)).filter(
                Incident.created_at >= today_start
            ).group_by(Incident.type).all()
            
            for incident_type, count in type_counts:
                by_type[incident_type] = count
            
            # Hourly timeseries for last 24 hours
            yesterday_start = today_start - timedelta(days=1)
            timeseries = []
            
            for hour in range(24):
                hour_start = yesterday_start + timedelta(hours=hour)
                hour_end = hour_start + timedelta(hours=1)
                
                count = db.query(Incident).filter(
                    Incident.created_at >= hour_start,
                    Incident.created_at < hour_end
                ).count()
                
                timeseries.append({
                    "t": hour_start.isoformat() + "Z",
                    "count": count
                })
            
            return {
                "today_count": today_count,
                "by_type": by_type,
                "timeseries": timeseries
            }
            
        except SQLAlchemyError as e:
            logger.error(f"Error fetching daily stats: {e}")
            return {
                "today_count": 0,
                "by_type": {},
                "timeseries": []
            }
        finally:
            db.close()
