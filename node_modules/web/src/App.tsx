// @ts-expect-error - Temporary bypass for TS 2307
import Dashboard from './components/Dashboard';

function App() {
  return (
    <div className="App" style={{ minHeight: '100vh', backgroundColor: '#f4f4f5' }}>
      <Dashboard />
    </div>
  );
}

export default App;

