import React, { useEffect, useRef } from 'react';
import { Chart, ChartConfiguration } from 'chart.js/auto';
import { DailyStats } from '../api';

interface HourlyChartProps {
  stats: DailyStats;
}

const HourlyChart: React.FC<HourlyChartProps> = ({ stats }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || !stats.timeseries) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Prepare data
    const labels = stats.timeseries.map(item => {
      const date = new Date(item.t);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        hour12: true
      });
    });

    const data = stats.timeseries.map(item => item.count);

    // Chart configuration
    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Incidents per Hour',
            data,
            borderColor: 'rgba(0, 122, 255, 0.8)',
            backgroundColor: 'rgba(0, 122, 255, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: 'rgba(0, 122, 255, 0.9)',
            pointBorderColor: 'rgba(255, 255, 255, 0.9)',
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8,
            pointHoverBackgroundColor: 'rgba(0, 122, 255, 1)',
            pointHoverBorderColor: 'rgba(255, 255, 255, 1)',
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            titleColor: '#1d1d1f',
            bodyColor: '#86868b',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            borderWidth: 1,
            cornerRadius: 12,
            displayColors: false,
            titleFont: {
              family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
              size: 14,
              weight: 600
            },
            bodyFont: {
              family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
              size: 13,
              weight: 400
            },
            padding: 12,
            callbacks: {
              title: (context) => `Hour: ${context[0].label}`,
              label: (context) => `${context.parsed.y} incident${context.parsed.y !== 1 ? 's' : ''}`
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)',
              font: {
                family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                size: 12,
                weight: 500
              },
              maxRotation: 0,
              padding: 8
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)',
              font: {
                family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                size: 12,
                weight: 500
              },
              padding: 8,
              callback: (value) => Math.floor(Number(value))
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        },
        elements: {
          point: {
            hoverBorderWidth: 3
          }
        }
      }
    };

    // Create new chart
    chartInstance.current = new Chart(ctx, config);

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [stats.timeseries]);

  if (!stats.timeseries || stats.timeseries.length === 0) {
    return (
      <div className="chart-container">
        <h3 className="chart-title">Incidents per Hour (Last 24h)</h3>
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem 1rem', 
          color: 'var(--text-secondary)',
          minHeight: '300px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
          <p>No data available</p>
          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Generate demo traffic to see the chart
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container slide-up">
      <h3 className="chart-title">Incidents per Hour (Last 24h)</h3>
      <div style={{ position: 'relative', height: '400px' }}>
        <canvas ref={chartRef} />
      </div>
      <div style={{ 
        textAlign: 'center', 
        marginTop: '1rem',
        fontSize: '0.875rem',
        color: 'var(--text-secondary)'
      }}>
        <span className="status-indicator">
          <span className="status-dot"></span>
          Live data • Auto-refreshing every 30 seconds
        </span>
      </div>
    </div>
  );
};

export default HourlyChart;
