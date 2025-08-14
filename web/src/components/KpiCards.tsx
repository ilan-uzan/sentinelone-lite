import React from 'react';
import { DailyStats } from '../api';

interface KpiCardsProps {
  stats: DailyStats;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ stats }) => {
  const getTopAttackingIp = () => {
    // This would typically come from the API, but for now we'll show a placeholder
    return "N/A";
  };

  const getSeverityBreakdown = () => {
    // This would typically come from the API, but for now we'll show type breakdown
    return stats.by_type;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Today's Incidents */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-2">Today's Incidents</h3>
        <div className="text-3xl font-bold text-blue-400">
          {stats.today_count}
        </div>
        <p className="text-sm text-gray-400 mt-1">
          Security events detected today
        </p>
      </div>

      {/* Top Attacking IP */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-2">Top Attacking IP</h3>
        <div className="text-xl font-mono text-red-400">
          {getTopAttackingIp()}
        </div>
        <p className="text-sm text-gray-400 mt-1">
          Most active threat source
        </p>
      </div>

      {/* Brute Force Count */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-2">Brute Force</h3>
        <div className="text-3xl font-bold text-orange-400">
          {stats.by_type.BRUTE_FORCE || 0}
        </div>
        <p className="text-sm text-gray-400 mt-1">
          Login attempts blocked
        </p>
      </div>

      {/* Port Scan Count */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-2">Port Scans</h3>
        <div className="text-3xl font-bold text-cyan-400">
          {stats.by_type.PORT_SCAN || 0}
        </div>
        <p className="text-sm text-gray-400 mt-1">
          Network probes detected
        </p>
      </div>
    </div>
  );
};
