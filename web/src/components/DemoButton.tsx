import React, { useState } from 'react';
import { generateDemoTraffic } from '../api';

interface DemoButtonProps {
  onTrafficGenerated: () => void;
}

const DemoButton: React.FC<DemoButtonProps> = ({ onTrafficGenerated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleClick = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      await generateDemoTraffic();
      setMessage('✅ Demo traffic generated successfully! Check the incidents table above.');
      onTrafficGenerated();
      
      // Clear message after 5 seconds
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      setMessage('❌ Failed to generate demo traffic. Please try again.');
      console.error('Demo traffic generation failed:', error);
      
      // Clear error message after 5 seconds
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="demo-button-container">
      <button
        className="demo-btn"
        onClick={handleClick}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className="loading-spinner"></span>
            Generating Demo Traffic...
          </>
        ) : (
          <>
            🚀 Generate Demo Traffic
          </>
        )}
      </button>
      
      {message && (
        <div 
          className="fade-in"
          style={{
            marginTop: '1rem',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-lg)',
            fontSize: '0.875rem',
            fontWeight: '500',
            backgroundColor: message.includes('✅') 
              ? 'rgba(52, 199, 89, 0.1)' 
              : 'rgba(255, 59, 48, 0.1)',
            color: message.includes('✅') 
              ? 'var(--success)' 
              : 'var(--danger)',
            border: `1px solid ${message.includes('✅') 
              ? 'rgba(52, 199, 89, 0.2)' 
              : 'rgba(255, 59, 48, 0.2)'}`,
            backdropFilter: 'blur(10px)',
            textAlign: 'center'
          }}
        >
          {message}
        </div>
      )}
      
      <div style={{
        marginTop: '1rem',
        fontSize: '0.875rem',
        color: 'var(--text-secondary)',
        textAlign: 'center',
        maxWidth: '500px',
        margin: '1rem auto 0'
      }}>
        <p>
          This will generate synthetic security events that trigger both brute force 
          and port scan detection rules, demonstrating the system's capabilities.
        </p>
      </div>
    </div>
  );
};

export default DemoButton;
