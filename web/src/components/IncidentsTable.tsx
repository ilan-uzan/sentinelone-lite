import React from 'react';
import { Incident } from '../api';

interface IncidentsTableProps {
  incidents: Incident[];
}

const IncidentsTable: React.FC<IncidentsTableProps> = ({ incidents }) => {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'HIGH':
        return 'badge-high';
      case 'MEDIUM':
        return 'badge-medium';
      case 'LOW':
        return 'badge-low';
      default:
        return 'badge-medium';
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'BRUTE_FORCE':
        return 'badge-brute-force';
      case 'PORT_SCAN':
        return 'badge-port-scan';
      default:
        return 'badge-medium';
    }
  };

  if (incidents.length === 0) {
    return (
      <div className="glass-card">
        <div className="glass-card-header">
          <h2 className="glass-card-title">Latest Incidents</h2>
          <p className="glass-card-subtitle">No security incidents detected</p>
        </div>
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛡️</div>
          <p>Your network is currently secure</p>
          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Use the demo button below to generate test traffic
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card slide-up">
      <div className="glass-card-header">
        <h2 className="glass-card-title">Latest Incidents</h2>
        <p className="glass-card-subtitle">
          {incidents.length} security incident{incidents.length !== 1 ? 's' : ''} detected
        </p>
      </div>
      
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Time</th>
              <th>IP Address</th>
              <th>Type</th>
              <th>Severity</th>
              <th>Count</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((incident) => (
              <tr key={incident.id} className="fade-in">
                <td>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                    {formatTimestamp(incident.created_at)}
                  </div>
                </td>
                <td>
                  <div style={{ fontFamily: 'monospace', fontWeight: '500' }}>
                    {incident.ip}
                  </div>
                </td>
                <td>
                  <span className={`badge ${getTypeBadge(incident.type)}`}>
                    {incident.type.replace('_', ' ')}
                  </span>
                </td>
                <td>
                  <span className={`badge ${getSeverityColor(incident.severity)}`}>
                    {incident.severity}
                  </span>
                </td>
                <td>
                  <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                    {incident.count}
                  </div>
                </td>
                <td>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {incident.meta?.ports ? (
                      <span>
                        Ports: {Array.isArray(incident.meta.ports) 
                          ? incident.meta.ports.slice(0, 3).join(', ')
                          : incident.meta.ports}
                        {Array.isArray(incident.meta.ports) && incident.meta.ports.length > 3 && '...'}
                      </span>
                    ) : (
                      incident.meta?.notes || 'No additional details'
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IncidentsTable;
