import { Shield, ShieldAlert, Wifi, WifiOff, Wind } from 'lucide-react';
import { useRealtime } from '../hooks/useRealtime';

export default function Dashboard() {
  const { events, isConnected } = useRealtime();

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'WEATHER_UPDATE': return <Wind className="text-blue-500" size={24} />;
      case 'NEW_ALERT': return <ShieldAlert className="text-red-500" size={24} />;
      default: return <Shield className="text-gray-500" size={24} />;
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', margin: 0, color: '#1a1a1a' }}>Aegis Command Center</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', color: isConnected ? '#16a34a' : '#dc2626' }}>
          {isConnected ? <Wifi size={20} /> : <WifiOff size={20} />}
          <span>{isConnected ? 'SYSTEM ONLINE' : 'CONNECTION LOST'}</span>
        </div>
      </header>

      <section>
        <h2 style={{ fontSize: '1.25rem', color: '#666', marginBottom: '1rem' }}>Live System Feed</h2>
        {events.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#f9fafb', borderRadius: '8px', color: '#9ca3af' }}>
            <p>Waiting for system triggers...</p>
            <p style={{ fontSize: '0.875rem' }}>The weather module will fire in 10 seconds.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {events.map((event, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1.5rem', backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ padding: '0.5rem', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
                  {getEventIcon(event.type)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 'bold', color: '#374151' }}>{event.type}</span>
                    <span style={{ fontSize: '0.875rem', color: '#9ca3af' }}>{event.timestamp.toLocaleTimeString()}</span>
                  </div>
                  <pre style={{ margin: 0, padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '6px', fontSize: '0.875rem', color: '#475569', overflowX: 'auto' }}>
                    {JSON.stringify(event.data, null, 2)}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}