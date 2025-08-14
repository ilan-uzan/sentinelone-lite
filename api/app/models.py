from sqlalchemy import Column, String, Integer, DateTime, Text, JSON, Index, Enum
from sqlalchemy.dialects.postgresql import UUID, TIMESTAMP
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
import uuid

Base = declarative_base()

class Incident(Base):
    __tablename__ = "incidents"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    ip = Column(Text, nullable=False)
    type = Column(Enum('BRUTE_FORCE', 'PORT_SCAN', name='incident_type'), nullable=False)
    count = Column(Integer, nullable=False)
    severity = Column(Enum('LOW', 'MEDIUM', 'HIGH', name='incident_severity'), nullable=False)
    meta = Column(JSON, default={})

class Event(Base):
    __tablename__ = "events"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ts = Column(TIMESTAMP(timezone=True), nullable=False)
    ip = Column(Text, nullable=False)
    category = Column(Text, nullable=False)
    port = Column(Integer)
    raw = Column(Text)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

# Create indexes
Index('idx_incidents_created_at', Incident.created_at.desc())
Index('idx_incidents_ip', Incident.ip)
Index('idx_incidents_type', Incident.type)
Index('idx_incidents_severity', Incident.severity)
Index('idx_events_ts', Event.ts.desc())
Index('idx_events_ip', Event.ip)
Index('idx_events_category', Event.category)
