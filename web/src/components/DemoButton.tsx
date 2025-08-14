import React, { useState } from 'react';
import { apiService } from '../api';

interface DemoButtonProps {
  onEventsGenerated: () => void;
}

export const DemoButton: React.FC<DemoButtonProps> = ({ onEventsGenerated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleGenerateDemoTraffic = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const result = await apiService.generateTestEvents();
      
      setMessage(`✅ Generated ${result.events_created} test events. Check for new incidents in a few seconds!`);
      
      // Trigger refresh after a short delay to allow detection engine to process
      setTimeout(() => {
        onEventsGenerated();
      }, 3000);
      
    } catch (error) {
      console.error('Error generating demo events:', error);
      setMessage('❌ Failed to generate demo events. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card">
      <h3 className="mb-4">Demo Traffic Generator</h3>
      <p className="text-sm text-gray-400 mb-4">
        Generate synthetic security events to test the detection engine. This will create:
      </p>
      <ul className="text-sm text-gray-400 mb-4 list-disc list-inside space-y-1">
        <li>Brute force attack simulation (12 failed login attempts)</li>
        <li>Port scan simulation (20 connection attempts to different ports)</li>
      </ul>
      
      <button
        onClick={handleGenerateDemoTraffic}
        disabled={isLoading}
        className="btn btn-primary"
      >
        {isLoading ? 'Generating...' : '🚀 Generate Demo Traffic'}
      </button>
      
      {message && (
        <div className={`mt-4 p-3 rounded-lg text-sm ${
          message.includes('✅') ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'
        }`}>
          {message}
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-500">
        <p>Expected results:</p>
        <ul className="list-disc list-inside space-y-1 mt-1">
          <li>MEDIUM severity BRUTE_FORCE incident from 203.0.113.7</li>
          <li>HIGH severity PORT_SCAN incident from 198.51.100.9</li>
        </ul>
      </div>
    </div>
  );
};
