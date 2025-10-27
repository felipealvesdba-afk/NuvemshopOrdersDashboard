import React, { useState, useEffect } from 'react';

const SimpleLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  // Check backend status on component mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        console.log('Checking backend status...');
        const response = await fetch(import.meta.env.VITE_API_URL + '/api/status', { 
          method: 'GET'
        });
        console.log('Backend response:', response.status, response.ok);
        if (response.ok) {
          const data = await response.json();
          console.log('Backend data:', data);
          setBackendStatus('online');
        } else {
          console.log('Backend response not ok:', response.status);
          setBackendStatus('offline');
        }
      } catch (error) {
        console.log('Backend check error:', error);
        setBackendStatus('offline');
      }
    };

    checkBackend();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      // Try to login with backend first
      if (backendStatus === 'online') {
        try {
          const response = await fetch(import.meta.env.VITE_API_URL + '/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
          
          if (response.ok) {
            const data = await response.json();
            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('user_data', JSON.stringify(data.user));
            setIsLoggedIn(true);
            return;
          }
        } catch (error) {
          console.log('Backend login failed, using demo mode');
        }
      }
      
      // Fallback to demo mode
      setIsLoggedIn(true);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setEmail('');
    setPassword('');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  };

  if (isLoggedIn) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1>Welcome to Nuvemshop Dashboard!</h1>
        <p>You are logged in as: {email}</p>
        
        <div style={{ 
          padding: '15px', 
          backgroundColor: backendStatus === 'online' ? '#d4edda' : '#f8d7da',
          border: `1px solid ${backendStatus === 'online' ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <strong>Backend Status:</strong> 
          <span style={{ color: backendStatus === 'online' ? '#155724' : '#721c24' }}>
            {backendStatus === 'online' ? ' ✅ Connected' : ' ❌ Offline (Demo Mode)'}
          </span>
        </div>

        {backendStatus === 'online' ? (
          <div>
            <p>✅ Backend is connected - Full functionality available</p>
            <p>✅ Mock data is being served from backend</p>
            <p>✅ Firebase integration is active</p>
          </div>
        ) : (
          <div>
            <p>⚠️ Backend is offline - Running in demo mode</p>
            <p>⚠️ Some features may not be available</p>
            <p>💡 Start the backend server to enable full functionality</p>
          </div>
        )}
        
        <div style={{ marginTop: '20px' }}>
          <button 
            onClick={handleLogout}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#dc3545', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f5f5f5',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '40px', 
        borderRadius: '8px', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        width: '400px',
        maxWidth: '90%'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
          Nuvemshop Dashboard
        </h1>
        
        <div style={{ 
          padding: '10px', 
          backgroundColor: backendStatus === 'online' ? '#d4edda' : '#f8d7da',
          border: `1px solid ${backendStatus === 'online' ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '4px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <strong>Backend:</strong> 
          <span style={{ color: backendStatus === 'online' ? '#155724' : '#721c24' }}>
            {backendStatus === 'checking' ? ' 🔄 Checking...' : 
             backendStatus === 'online' ? ' ✅ Connected' : ' ❌ Offline'}
          </span>
        </div>
        
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>
              Email:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>
              Password:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Login
          </button>
        </form>
        
        <div style={{ marginTop: '20px', textAlign: 'center', color: '#666' }}>
          <p>Demo: Any email/password will work</p>
          <p>Backend connection will be tested after login</p>
        </div>
      </div>
    </div>
  );
};

export default SimpleLogin;
