import axios from 'axios';

// Extend ImportMeta interface for Vite
declare global {
  interface ImportMeta {
    env: {
      VITE_API_BASE: string;
    };
  }
}

// Use relative path since nginx proxies /api/ to the backend
const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Incident {
  id: string;
  created_at: string;
  ip: string;
  type: 'BRUTE_FORCE' | 'PORT_SCAN';
  count: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  meta?: {
    ports?: number[];
    notes?: string;
    window_minutes?: number;
  };
}

export interface DailyStats {
  today_count: number;
  by_type: {
    BRUTE_FORCE?: number;
    PORT_SCAN?: number;
  };
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

// API functions
export const getIncidents = async (limit: number = 50): Promise<Incident[]> => {
  const response = await apiClient.get(`/incidents?limit=${limit}`);
  return response.data;
};

export const getDailyStats = async (): Promise<DailyStats> => {
  const response = await apiClient.get('/stats/daily');
  return response.data;
};

export const getHealth = async (): Promise<HealthStatus> => {
  const response = await apiClient.get('/health');
  return response.data;
};

export const generateDemoTraffic = async (): Promise<void> => {
  await apiClient.post('/test-event');
};
