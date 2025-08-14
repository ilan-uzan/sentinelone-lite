# 🛡️ SentinelOne Lite - Cybersecurity Monitoring MVP

**Educational OSS Project** - A lightweight, end-to-end cybersecurity monitoring system that demonstrates real-time threat detection, incident management, and alerting capabilities.

> ⚠️ **Important**: This is an educational open-source project and is NOT affiliated with SentinelOne Inc. Do not deploy this to production networks.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Git

### Setup
```bash
# Clone the repository
git clone https://github.com/your-username/sentinelone-lite.git
cd sentinelone-lite

# Copy environment files
cp api/env.example api/.env
cp web/env.example web/.env

# Edit API environment variables (optional)
# Configure Slack webhook or SMTP settings in api/.env

# Start the application
docker compose up --build
```

### Access Points
- **Dashboard**: http://localhost:5173
- **API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 🎯 Demo Instructions

### Generate Test Traffic
1. Open the dashboard at http://localhost:5173
2. Click the **"🚀 Generate Demo Traffic"** button
3. Wait 3-5 seconds for the detection engine to process events
4. Watch new incidents appear in the dashboard!

### What to Expect
- **Brute Force Detection**: IP `203.0.113.7` will trigger a MEDIUM severity incident after 12 failed login attempts
- **Port Scan Detection**: IP `198.51.100.9` will trigger a HIGH severity incident after probing 20 different ports
- **Real-time Updates**: Dashboard auto-refreshes every 30 seconds
- **Alerts**: If configured, Slack/email alerts will be sent for MEDIUM+ severity incidents

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Frontend  │    │   FastAPI API   │    │   PostgreSQL    │
│   (React + Vite)│◄──►│  + Detection    │◄──►│     Database    │
│   Port 5173     │    │   Engine        │    │   Port 5432     │
└─────────────────┘    │   Port 8000     │    └─────────────────┘
                       └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Alert System  │
                       │  Slack/Email    │
                       └─────────────────┘
```

### Components
- **Frontend**: React dashboard with real-time charts and incident tables
- **API**: FastAPI backend with detection engine and alerting
- **Detection Engine**: In-memory sliding window analysis for brute force and port scan detection
- **Database**: PostgreSQL with optimized indexes for incident storage
- **Alerts**: Configurable Slack webhook or SMTP email notifications

## 🔧 Configuration

### API Environment Variables (`api/.env`)
```bash
# Database
DATABASE_URL=postgresql+psycopg2://postgres:postgres@db:5432/s1lite

# Alert Configuration
ALERT_CHANNEL=slack        # "slack" or "email"

# Slack (if ALERT_CHANNEL=slack)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK

# SMTP (if ALERT_CHANNEL=email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="SentinelOne Lite <noreply@s1-lite.local>"
ALERT_TO="security-team@yourcompany.com"
```

### Web Environment Variables (`web/.env`)
```bash
VITE_API_BASE=http://localhost:8000
```

## 📊 Detection Rules

### Brute Force Detection
- **Threshold**: 10+ AUTH_FAIL events from same IP
- **Time Window**: 5 minutes (sliding)
- **Severity**: MEDIUM
- **Trigger**: Multiple failed login attempts

### Port Scan Detection
- **Threshold**: 15+ distinct ports probed from same IP
- **Time Window**: 3 minutes (sliding)
- **Severity**: HIGH
- **Trigger**: Multiple connection attempts to different ports

## 🗄️ Database Schema

### Incidents Table
```sql
CREATE TABLE incidents (
    id UUID PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    ip TEXT NOT NULL,
    type incident_type NOT NULL,
    count INTEGER NOT NULL,
    severity incident_severity NOT NULL,
    meta JSONB DEFAULT '{}'
);
```

### Events Table
```sql
CREATE TABLE events (
    id UUID PRIMARY KEY,
    ts TIMESTAMPTZ NOT NULL,
    ip TEXT NOT NULL,
    category TEXT NOT NULL,
    port INTEGER,
    raw TEXT
);
```

## 🚀 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check with database status |
| `/incidents` | GET | Latest incidents (limit: 50) |
| `/stats/daily` | GET | Daily statistics and hourly timeseries |
| `/test-event` | POST | Generate synthetic test events |

### Example Responses

**GET /incidents**
```json
[
  {
    "id": "b3c3f8c6-...",
    "created_at": "2025-08-14T15:00:23Z",
    "ip": "198.51.100.9",
    "type": "PORT_SCAN",
    "count": 20,
    "severity": "HIGH",
    "meta": {"ports": [21,22,23,25,53,80,110,143,443]}
  }
]
```

**GET /stats/daily**
```json
{
  "today_count": 7,
  "by_type": {"BRUTE_FORCE": 3, "PORT_SCAN": 4},
  "timeseries": [{"t": "2025-08-14T00:00:00Z", "count": 0}]
}
```

## 🧪 Testing

### Manual Testing
```bash
# Health check
curl http://localhost:8000/health

# Get incidents
curl http://localhost:8000/incidents

# Get daily stats
curl http://localhost:8000/stats/daily

# Generate test events
curl -X POST http://localhost:8000/test-event
```

### Automated Testing
```bash
# Run tests (when implemented)
pytest api/tests/
```

## 🔒 Security Considerations

- **Demo Only**: This application is designed for educational purposes
- **No Authentication**: Dashboard has no access controls
- **Network Exposure**: Services bind to all interfaces (0.0.0.0)
- **Database**: Uses default PostgreSQL credentials
- **Alerts**: Configure alert channels carefully to avoid spam

## 🚧 What's Next (Post-MVP)

- **Geo-IP Integration**: Add MaxMind/ipinfo for location-based threat intelligence
- **Auto-blocking**: Implement ufw rule management for automatic threat response
- **Log Parsing**: Support for auth.log, Suricata eve.json ingestion
- **Authentication**: Basic auth or OAuth for dashboard access
- **Real-time Events**: WebSocket support for live incident updates
- **Threat Intelligence**: Integration with abuse.ch, VirusTotal APIs
- **Machine Learning**: Anomaly detection beyond rule-based analysis

## 🛠️ Development

### Local Development
```bash
# API Development
cd api
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload

# Web Development
cd web
npm install
npm run dev
```

### Database Migrations
```bash
# Apply migrations manually (if needed)
docker exec -it sentinelone-lite-db-1 psql -U postgres -d s1lite -f /docker-entrypoint-initdb.d/migrations.sql
```

### Logs
```bash
# View API logs
docker compose logs api

# View database logs
docker compose logs db

# View web logs
docker compose logs web
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📚 Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Chart.js Documentation](https://www.chartjs.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Documentation](https://docs.docker.com/)

## ⚠️ Disclaimer

This software is provided "as is" without warranty of any kind. The authors are not responsible for any damage or loss resulting from the use of this software. This is an educational project and should not be used in production environments without proper security review and hardening.

---

**Built with ❤️ for the cybersecurity community**
