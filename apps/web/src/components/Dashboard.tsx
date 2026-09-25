import { useState, useEffect } from 'react';
import Login from './Login';
import { fetchEventSource } from '@microsoft/fetch-event-source';

export default function Dashboard() {
  // Check if they are logged in right when the component mounts
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    !!localStorage.getItem('aegis_token')
  );
  const [alerts, setAlerts] = useState<any[]>([]);

  const handleLogout = () => {
    localStorage.removeItem('aegis_token');
    setIsAuthenticated(false);
  };

  const fetchAlerts = async () => {
    const token = localStorage.getItem('aegis_token');
    
    try {
      const response = await fetch('http://localhost:3000/alerts', {
        headers: {
          'Authorization': `Bearer ${token}` // <--- Inject the token!
        }
      });
      
      if (response.status === 401) {
        handleLogout(); // Kick them out if the token is expired/invalid
        return;
      }
      
      const data = await response.json();
      setAlerts(data);
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
    }
  };

  // 1. Initial Data Load
  useEffect(() => {
    if (isAuthenticated) {
      fetchAlerts();
    }
  }, [isAuthenticated]);

  // 2. Secure SSE Stream Connection
  useEffect(() => {
    if (!isAuthenticated) return;

    const token = localStorage.getItem('aegis_token');
    const abortController = new AbortController();

    const connectSecureStream = async () => {
      try {
        await fetchEventSource('http://localhost:3000/api/realtime/stream', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          signal: abortController.signal,
          async onopen(response) {
            if (response.ok) {
              console.log('🛡️ Secure SSE Stream Connected!');
              return;
            }
            if (response.status === 401) {
              console.error('Stream access denied: Token expired');
              handleLogout();
              throw new Error('Unauthorized');
            }
          },
          onmessage(event) {
            try {
              const incomingAlert = JSON.parse(event.data);
              // Push the new alert to the top of the UI list
              setAlerts((prevAlerts) => [incomingAlert, ...prevAlerts]);
            } catch (err) {
              console.error("Failed to parse stream event", err);
            }
          },
          onerror(err) {
            console.error('Stream connection error:', err);
          },
        });
      } catch (err) {
        console.log('Stream disconnected.');
      }
    };

    connectSecureStream();

    // Cleanup function: Kill the stream when the component unmounts or user logs out
    return () => {
      abortController.abort();
    };
  }, [isAuthenticated]);

  // The Gatekeeper: If no token, show the Login screen
  if (!isAuthenticated) {
    return <Login onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="dashboard-container" style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <h1 style={{ color: '#e2e8f0', margin: 0 }}>Aegis Dashboard</h1>
        <button 
          onClick={handleLogout} 
          style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Secure Logout
        </button>
      </header>
      
      <div className="alerts-feed">
        <h2 style={{ color: '#94a3b8', fontSize: '1.2rem', marginBottom: '1rem' }}>Live Security Events</h2>
        
        {alerts.length === 0 ? (
          <p style={{ color: '#64748b' }}>System is secure. No recent alerts.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {alerts.map((alert, index) => (
              <div 
                key={alert.id || index} 
                style={{ 
                  background: '#1e293b', 
                  padding: '1rem', 
                  borderRadius: '6px',
                  borderLeft: `4px solid ${alert.severity === 'CRITICAL' ? '#ef4444' : alert.severity === 'WARNING' ? '#f59e0b' : '#3b82f6'}`,
                  color: '#e2e8f0'
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{alert.message}</div>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                  {new Date(alert.createdAt || Date.now()).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}