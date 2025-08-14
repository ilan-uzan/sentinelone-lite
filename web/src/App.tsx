import React, { useState, useEffect } from 'react';
import { KpiCards } from './components/KpiCards';
import { IncidentsTable } from './components/IncidentsTable';
import { HourlyChart } from './components/HourlyChart';
import { DemoButton } from './components/DemoButton';
import { apiService, Incident, DailyStats } from './api';

function App() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [stats, setStats] = useState<DailyStats>({
    today_count: 0,
    by_type: {},
    timeseries: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch data in parallel
      const [incidentsData, statsData] = await Promise.all([
        apiService.getIncidents(50),
        apiService.getDailyStats()
      ]);
      
      setIncidents(incidentsData);
      setStats(statsData);
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data. Please check if the API is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleEventsGenerated = () => {
    // Refresh data after demo events are generated
    setTimeout(fetchData, 2000);
  };

  if (loading && incidents.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading SentinelOne Lite...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-4">Connection Error</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <button onClick={fetchData} className="btn btn-primary">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="text-center mb-8">
          <h1 className="mb-2">🛡️ SentinelOne Lite</h1>
          <p className="text-gray-400 text-lg">
            Lightweight Cybersecurity Monitoring Dashboard
          </p>
        </div>
        
        {/* Demo Button */}
        <div className="max-w-2xl mx-auto mb-8">
          <DemoButton onEventsGenerated={handleEventsGenerated} />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto space-y-6">
        {/* KPI Cards */}
        <KpiCards stats={stats} />
        
        {/* Chart and Table Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hourly Chart */}
          <div className="lg:col-span-2">
            <HourlyChart stats={stats} />
          </div>
          
          {/* Incidents Table */}
          <div className="lg:col-span-2">
            <IncidentsTable incidents={incidents} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-700">
        <div className="text-center text-gray-400 text-sm">
          <p>
            SentinelOne Lite - Educational OSS Project | 
            <a 
              href="https://github.com/your-username/sentinelone-lite" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 ml-1"
            >
              GitHub
            </a>
          </p>
          <p className="mt-1">
            ⚠️ This is a demo application. Do not deploy to production networks.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
