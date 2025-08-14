import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

export interface Incident {
  id: string;
  created_at: string;
  ip: string;
  type: string;
  count: number;
  severity: string;
  meta: Record<string, any>;
}

export interface DailyStats {
  today_count: number;
  by_type: Record<string, number>;
  timeseries: Array<{
    t: string;
    count: number;
  }>;
}

export interface HealthStatus {
  status: string;
  timestamp: string;
  database: string;
}

export const apiService = {
  // Health check
  async getHealth(): Promise<HealthStatus> {
    const response = await api.get('/health');
    return response.data;
  },

  // Get incidents
  async getIncidents(limit: number = 50): Promise<Incident[]> {
    const response = await api.get(`/incidents?limit=${limit}`);
    return response.data;
  },

  // Get daily statistics
  async getDailyStats(): Promise<DailyStats> {
    const response = await api.get('/stats/daily');
    return response.data;
  },

  // Generate test events
  async generateTestEvents(): Promise<any> {
    const response = await api.post('/test-event');
    return response.data;
  },
};

export default apiService;
