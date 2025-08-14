-- SentinelOne Lite Database Schema

-- Create enums
CREATE TYPE incident_type AS ENUM ('BRUTE_FORCE', 'PORT_SCAN');
CREATE TYPE incident_severity AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- Create incidents table
CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    ip TEXT NOT NULL,
    type incident_type NOT NULL,
    count INTEGER NOT NULL,
    severity incident_severity NOT NULL,
    meta JSONB DEFAULT '{}',
    CONSTRAINT incidents_count_positive CHECK (count > 0)
);

-- Create events table for detailed logging and charts
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ts TIMESTAMPTZ NOT NULL,
    ip TEXT NOT NULL,
    category TEXT NOT NULL,
    port INTEGER,
    raw TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON incidents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_ip ON incidents(ip);
CREATE INDEX IF NOT EXISTS idx_incidents_type ON incidents(type);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);
CREATE INDEX IF NOT EXISTS idx_events_ts ON events(ts DESC);
CREATE INDEX IF NOT EXISTS idx_events_ip ON events(ip);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);

-- Insert sample data for testing (optional)
INSERT INTO incidents (ip, type, count, severity, meta) VALUES
    ('203.0.113.1', 'BRUTE_FORCE', 15, 'MEDIUM', '{"ports": [22], "notes": "Sample brute force attack"}'),
    ('198.51.100.1', 'PORT_SCAN', 25, 'HIGH', '{"ports": [21,22,23,25,53,80,110,143,443,993,995,3306,5432,8080], "notes": "Sample port scan"}')
ON CONFLICT DO NOTHING;
