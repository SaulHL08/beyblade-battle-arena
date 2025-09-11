import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import './App.css';

function AppContent() {
  const [authMode, setAuthMode] = useState('login');
  const { currentUser, setCurrentUser } = useAuth();

  const handleAuthSuccess = () => {
    window.location.reload();
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthMode('login');
  };

  if (currentUser) {
    return <Dashboard onLogout={handleLogout} />;
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
      color: 'white'
    }}>
      {authMode === 'login' ? (
        <Login 
          onSuccess={handleAuthSuccess}
          switchToRegister={() => setAuthMode('register')}
        />
      ) : (
        <Register 
          onSuccess={handleAuthSuccess}
          switchToLogin={() => setAuthMode('login')}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;