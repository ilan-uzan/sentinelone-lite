import { useState, useEffect } from 'react';
import KpiCards from './components/KpiCards';
import HourlyChart from './components/HourlyChart';
import IncidentsTable from './components/IncidentsTable';
import DemoButton from './components/DemoButton';
import { Incident, DailyStats, getIncidents, getDailyStats } from './api';

function App() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [stats, setStats] = useState<DailyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setError(null);
      const [incidentsData, statsData] = await Promise.all([
        getIncidents(),
        getDailyStats()
      ]);
      setIncidents(incidentsData);
      setStats(statsData);
    } catch (err) {
      setError('Failed to fetch data. Please check if the API is running.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleTrafficGenerated = () => {
    // Refresh data after demo traffic is generated
    setTimeout(fetchData, 2000);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loading-spinner" style={{ 
            width: '60px', 
            height: '60px', 
            borderWidth: '4px',
            margin: '0 auto 2rem'
          }}></div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            SentinelOne Lite
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            Loading security dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem'
      }}>
        <div className="glass-card" style={{ textAlign: 'center', maxWidth: '500px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
            Connection Error
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            {error}
          </p>
          <button 
            className="btn btn-primary"
            onClick={fetchData}
          >
            🔄 Retry Connection
          </button>
          <div style={{ 
            marginTop: '1.5rem', 
            fontSize: '0.875rem', 
            color: 'var(--text-secondary)',
            padding: '1rem',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 'var(--radius-lg)'
          }}>
            <p style={{ marginBottom: '0.5rem' }}><strong>Quick Fix:</strong></p>
            <p>1. Ensure Docker is running</p>
            <p>2. Run <code style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '0.2rem 0.4rem', borderRadius: '0.25rem' }}>./start.sh</code></p>
            <p>3. Wait for services to start</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate KPI data
  const todayCount = stats?.today_count || 0;
  const topAttackingIp = incidents.length > 0 ? incidents[0].ip : 'None';
  const bruteForceCount = stats?.by_type?.BRUTE_FORCE || 0;
  const portScanCount = stats?.by_type?.PORT_SCAN || 0;

  return (
    <div style={{ 
      minHeight: '100vh',
      padding: '2rem',
      maxWidth: '1400px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <header style={{ 
        textAlign: 'center', 
        marginBottom: '3rem',
        padding: '2rem 0'
      }}>
        <h1 style={{
          fontSize: 'var(--font-size-4xl)',
          fontWeight: '700',
          color: 'white',
          marginBottom: '1rem',
          textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
        }}>
          🛡️ SentinelOne Lite
        </h1>
        <p style={{
          fontSize: 'var(--font-size-lg)',
          color: 'rgba(255, 255, 255, 0.9)',
          fontWeight: '400',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          Real-time cybersecurity monitoring dashboard with intelligent threat detection
        </p>
      </header>

      {/* KPI Cards */}
      <KpiCards
        todayCount={todayCount}
        topAttackingIp={topAttackingIp}
        bruteForceCount={bruteForceCount}
        portScanCount={portScanCount}
      />

      {/* Chart */}
      {stats && <HourlyChart stats={stats} />}

      {/* Incidents Table */}
      <IncidentsTable incidents={incidents} />

      {/* Demo Button */}
      <DemoButton onTrafficGenerated={handleTrafficGenerated} />

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        marginTop: '4rem',
        padding: '2rem 0',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: '0.875rem'
      }}>
        <p>
          <strong>SentinelOne Lite</strong> • Open Source Security Monitoring
        </p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
          Educational project • Not affiliated with SentinelOne Inc.
        </p>
      </footer>
    </div>
  );
}

export default App;
