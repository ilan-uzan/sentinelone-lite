import React from 'react';
import { Incident } from '../api';

interface IncidentsTableProps {
  incidents: Incident[];
}

export const IncidentsTable: React.FC<IncidentsTableProps> = ({ incidents }) => {
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getSeverityBadge = (severity: string) => {
    const severityClass = `badge-${severity.toLowerCase()}`;
    return <span className={`badge ${severityClass}`}>{severity}</span>;
  };

  const getTypeBadge = (type: string) => {
    const typeClass = `badge-${type.toLowerCase().replace('_', '-')}`;
    return <span className={`badge ${typeClass}`}>{type.replace('_', ' ')}</span>;
  };

  if (incidents.length === 0) {
    return (
      <div className="card">
        <h3>Latest Incidents</h3>
        <p className="text-gray-400 text-center py-8">No incidents detected yet.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="mb-4">Latest Incidents</h3>
      <div className="overflow-x-auto">
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
              <tr key={incident.id}>
                <td className="text-sm">
                  {formatTimestamp(incident.created_at)}
                </td>
                <td className="font-mono text-sm">
                  {incident.ip}
                </td>
                <td>
                  {getTypeBadge(incident.type)}
                </td>
                <td>
                  {getSeverityBadge(incident.severity)}
                </td>
                <td className="text-center font-semibold">
                  {incident.count}
                </td>
                <td className="text-sm">
                  {incident.meta?.ports && (
                    <div>
                      <span className="text-gray-400">Ports: </span>
                      <span className="font-mono">
                        {incident.meta.ports.slice(0, 3).join(', ')}
                        {incident.meta.ports.length > 3 && ` (+${incident.meta.ports.length - 3})`}
                      </span>
                    </div>
                  )}
                  {incident.meta?.window_minutes && (
                    <div>
                      <span className="text-gray-400">Window: </span>
                      <span>{incident.meta.window_minutes}m</span>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
