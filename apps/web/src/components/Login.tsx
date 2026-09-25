import { useState } from 'react';
import './Login.css'; // Optional: Extract the CSS below into a file

interface LoginProps {
  onSuccess: () => void;
}

export default function Login({ onSuccess }: LoginProps) {
  const [email, setEmail] = useState('homeowner@aegis.local');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials. Access denied.');
      }

      const data = await response.json();
      
      // Store the golden key in the browser
      localStorage.setItem('aegis_token', data.access_token);
      
      // Tell the Dashboard to reveal itself
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2>Aegis Secure Gateway</h2>
        <p className="subtitle">System Authentication Required</p>
        
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Email ID</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          
          <div className="input-group">
            <label>Passcode</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Authenticating...' : 'Access System'}
          </button>
          
          {error && <p className="error-text">{error}</p>}
        </form>
      </div>
    </div>
  );
}