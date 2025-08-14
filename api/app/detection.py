from collections import deque
from datetime import datetime, timedelta
from typing import Dict, Deque, Set
import logging
from .models import Incident, Event
from .repo import IncidentRepository
from .alerts import AlertManager

logger = logging.getLogger(__name__)

class DetectionEngine:
    def __init__(self, incident_repo: IncidentRepository, alert_manager: AlertManager):
        self.incident_repo = incident_repo
        self.alert_manager = alert_manager
        
        # In-memory state for sliding windows
        self.auth_failures: Dict[str, Deque[datetime]] = {}
        self.port_touches: Dict[str, Dict[int, datetime]] = {}
        
        # Detection thresholds
        self.BRUTE_FORCE_THRESHOLD = 10
        self.BRUTE_FORCE_WINDOW = timedelta(minutes=5)
        self.PORT_SCAN_THRESHOLD = 15
        self.PORT_SCAN_WINDOW = timedelta(minutes=3)
    
    def process_event(self, event: Event) -> None:
        """Process a security event and check for incidents"""
        try:
            # Store the event
            self.incident_repo.create_event(event)
            
            # Check for brute force attacks
            if event.category == "AUTH_FAIL":
                self._check_brute_force(event.ip, event.ts)
            
            # Check for port scans
            if event.category == "CONN_ATTEMPT" and event.port:
                self._check_port_scan(event.ip, event.port, event.ts)
                
        except Exception as e:
            logger.error(f"Error processing event: {e}")
    
    def _check_brute_force(self, ip: str, timestamp: datetime) -> None:
        """Check if IP has exceeded brute force threshold"""
        if ip not in self.auth_failures:
            self.auth_failures[ip] = deque()
        
        # Add current timestamp
        self.auth_failures[ip].append(timestamp)
        
        # Prune old entries outside window
        cutoff = timestamp - self.BRUTE_FORCE_WINDOW
        while self.auth_failures[ip] and self.auth_failures[ip][0] < cutoff:
            self.auth_failures[ip].popleft()
        
        # Check threshold
        if len(self.auth_failures[ip]) >= self.BRUTE_FORCE_THRESHOLD:
            self._raise_incident(
                ip=ip,
                incident_type="BRUTE_FORCE",
                count=len(self.auth_failures[ip]),
                severity="MEDIUM",
                meta={"window_minutes": 5, "ports": [22]}
            )
    
    def _check_port_scan(self, ip: str, port: int, timestamp: datetime) -> None:
        """Check if IP has exceeded port scan threshold"""
        if ip not in self.port_touches:
            self.port_touches[ip] = {}
        
        # Add current port touch
        self.port_touches[ip][port] = timestamp
        
        # Prune old entries outside window
        cutoff = timestamp - self.PORT_SCAN_WINDOW
        ports_to_remove = [
            p for p, ts in self.port_touches[ip].items() 
            if ts < cutoff
        ]
        for p in ports_to_remove:
            del self.port_touches[ip][p]
        
        # Check threshold
        if len(self.port_touches[ip]) >= self.PORT_SCAN_THRESHOLD:
            self._raise_incident(
                ip=ip,
                incident_type="PORT_SCAN",
                count=len(self.port_touches[ip]),
                severity="HIGH",
                meta={
                    "window_minutes": 3,
                    "ports": list(self.port_touches[ip].keys())
                }
            )
    
    def _raise_incident(self, ip: str, incident_type: str, count: int, 
                       severity: str, meta: dict) -> None:
        """Create an incident and send alert"""
        try:
            # Check if incident already exists for this IP and type in recent time
            recent_incident = self.incident_repo.get_recent_incident(ip, incident_type)
            if recent_incident:
                logger.info(f"Incident already exists for {ip} {incident_type}")
                return
            
            # Create incident
            incident = Incident(
                ip=ip,
                type=incident_type,
                count=count,
                severity=severity,
                meta=meta
            )
            
            created_incident = self.incident_repo.create_incident(incident)
            logger.info(f"Created {incident_type} incident for {ip}: {severity} severity")
            
            # Send alert for MEDIUM+ severity
            if severity in ["MEDIUM", "HIGH"]:
                self.alert_manager.send_alert(created_incident)
                
        except Exception as e:
            logger.error(f"Error raising incident: {e}")
    
    def cleanup_old_data(self) -> None:
        """Clean up old in-memory data"""
        now = datetime.now(datetime.timezone.utc)
        
        # Clean auth failures
        for ip in list(self.auth_failures.keys()):
            cutoff = now - self.BRUTE_FORCE_WINDOW
            while self.auth_failures[ip] and self.auth_failures[ip][0] < cutoff:
                self.auth_failures[ip].popleft()
            if not self.auth_failures[ip]:
                del self.auth_failures[ip]
        
        # Clean port touches
        for ip in list(self.port_touches.keys()):
            cutoff = now - self.PORT_SCAN_WINDOW
            ports_to_remove = [
                p for p, ts in self.port_touches[ip].items() 
                if ts < cutoff
            ]
            for p in ports_to_remove:
                del self.port_touches[ip][p]
            if not self.port_touches[ip]:
                del self.port_touches[ip]
