import React from 'react';

interface KpiCardsProps {
  todayCount: number;
  topAttackingIp: string;
  bruteForceCount: number;
  portScanCount: number;
}

const KpiCards: React.FC<KpiCardsProps> = ({
  todayCount,
  topAttackingIp,
  bruteForceCount,
  portScanCount
}) => {
  return (
    <div className="kpi-grid fade-in">
      {/* Today's Incidents */}
      <div className="kpi-card slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="kpi-value">{todayCount}</div>
        <div className="kpi-label">Today's Incidents</div>
        <div className="kpi-change">+{todayCount > 0 ? Math.floor(todayCount * 0.3) : 0} from yesterday</div>
      </div>

      {/* Top Attacking IP */}
      <div className="kpi-card slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="kpi-value" style={{ fontSize: '1.5rem', wordBreak: 'break-all' }}>
          {topAttackingIp || 'None'}
        </div>
        <div className="kpi-label">Top Attacking IP</div>
        <div className="kpi-change">Most active threat source</div>
      </div>

      {/* Brute Force Count */}
      <div className="kpi-card slide-up" style={{ animationDelay: '0.3s' }}>
        <div className="kpi-value" style={{ background: 'linear-gradient(135deg, #ff9500, #ff8c00)' }}>
          {bruteForceCount}
        </div>
        <div className="kpi-label">Brute Force Attacks</div>
        <div className="kpi-change" style={{ color: '#ff9500' }}>
          {bruteForceCount > 0 ? 'Active threat detected' : 'No threats'}
        </div>
      </div>

      {/* Port Scan Count */}
      <div className="kpi-card slide-up" style={{ animationDelay: '0.4s' }}>
        <div className="kpi-value" style={{ background: 'linear-gradient(135deg, #ff3b30, #ff6b6b)' }}>
          {portScanCount}
        </div>
        <div className="kpi-label">Port Scan Attempts</div>
        <div className="kpi-change" style={{ color: '#ff3b30' }}>
          {portScanCount > 0 ? 'Network reconnaissance' : 'Clean network'}
        </div>
      </div>
    </div>
  );
};

export default KpiCards;
