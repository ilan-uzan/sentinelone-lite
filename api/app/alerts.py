import os
import logging
import httpx
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from .models import Incident

logger = logging.getLogger(__name__)

class AlertManager:
    def __init__(self):
        self.alert_channel = os.getenv("ALERT_CHANNEL", "slack").lower()
        self.slack_webhook_url = os.getenv("SLACK_WEBHOOK_URL")
        self.smtp_host = os.getenv("SMTP_HOST")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USER")
        self.smtp_pass = os.getenv("SMTP_PASS")
        self.smtp_from = os.getenv("SMTP_FROM", "SentinelOne Lite <noreply@s1-lite.local>")
        self.alert_to = os.getenv("ALERT_TO")
        
        # Validate configuration
        if self.alert_channel == "slack" and not self.slack_webhook_url:
            logger.warning("Slack webhook URL not configured, alerts will be logged only")
        elif self.alert_channel == "email" and not all([self.smtp_host, self.smtp_user, self.smtp_pass, self.alert_to]):
            logger.warning("SMTP configuration incomplete, alerts will be logged only")
    
    def send_alert(self, incident: Incident) -> bool:
        """Send alert for an incident"""
        try:
            if self.alert_channel == "slack":
                return self._send_slack_alert(incident)
            elif self.alert_channel == "email":
                return self._send_email_alert(incident)
            else:
                logger.warning(f"Unknown alert channel: {self.alert_channel}")
                return False
        except Exception as e:
            logger.error(f"Error sending alert: {e}")
            return False
    
    def _send_slack_alert(self, incident: Incident) -> bool:
        """Send Slack alert via webhook"""
        if not self.slack_webhook_url:
            logger.warning("Slack webhook URL not configured")
            return False
        
        try:
            # Create Slack message
            color = "#ff6b6b" if incident.severity == "HIGH" else "#ffa726"
            
            message = {
                "attachments": [
                    {
                        "color": color,
                        "title": f"🚨 Security Incident: {incident.type}",
                        "fields": [
                            {
                                "title": "IP Address",
                                "value": incident.ip,
                                "short": True
                            },
                            {
                                "title": "Severity",
                                "value": incident.severity,
                                "short": True
                            },
                            {
                                "title": "Count",
                                "value": str(incident.count),
                                "short": True
                            },
                            {
                                "title": "Time",
                                "value": incident.created_at.strftime("%Y-%m-%d %H:%M:%S UTC"),
                                "short": True
                            }
                        ],
                        "footer": "SentinelOne Lite",
                        "ts": int(incident.created_at.timestamp())
                    }
                ]
            }
            
            # Add metadata if available
            if incident.meta:
                if "ports" in incident.meta:
                    ports_str = ", ".join(map(str, incident.meta["ports"][:10]))  # Limit to first 10
                    if len(incident.meta["ports"]) > 10:
                        ports_str += f" (+{len(incident.meta['ports']) - 10} more)"
                    message["attachments"][0]["fields"].append({
                        "title": "Ports",
                        "value": ports_str,
                        "short": False
                    })
                
                if "window_minutes" in incident.meta:
                    message["attachments"][0]["fields"].append({
                        "title": "Detection Window",
                        "value": f"{incident.meta['window_minutes']} minutes",
                        "short": True
                    })
            
            # Send webhook
            with httpx.Client(timeout=10.0) as client:
                response = client.post(self.slack_webhook_url, json=message)
                response.raise_for_status()
                
            logger.info(f"Slack alert sent for {incident.type} incident from {incident.ip}")
            return True
            
        except Exception as e:
            logger.error(f"Error sending Slack alert: {e}")
            return False
    
    def _send_email_alert(self, incident: Incident) -> bool:
        """Send email alert via SMTP"""
        if not all([self.smtp_host, self.smtp_user, self.smtp_pass, self.alert_to]):
            logger.warning("SMTP configuration incomplete")
            return False
        
        try:
            # Create email message
            subject = f"🚨 Security Alert: {incident.type} from {incident.ip}"
            
            body = f"""
Security Incident Detected

Type: {incident.type}
IP Address: {incident.ip}
Severity: {incident.severity}
Count: {incident.count}
Time: {incident.created_at.strftime("%Y-%m-%d %H:%M:%S UTC")}

Metadata:
"""
            
            if incident.meta:
                for key, value in incident.meta.items():
                    body += f"  {key}: {value}\n"
            
            body += f"""

This is an automated alert from SentinelOne Lite.
Please investigate this security incident immediately.

---
SentinelOne Lite Security Monitoring
"""
            
            # Create MIME message
            msg = MIMEMultipart()
            msg['From'] = self.smtp_from
            msg['To'] = self.alert_to
            msg['Subject'] = subject
            
            msg.attach(MIMEText(body, 'plain'))
            
            # Send email
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_pass)
                server.send_message(msg)
            
            logger.info(f"Email alert sent for {incident.type} incident from {incident.ip}")
            return True
            
        except Exception as e:
            logger.error(f"Error sending email alert: {e}")
            return False
