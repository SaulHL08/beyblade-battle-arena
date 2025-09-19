import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import Garage from './components/Garage/Garage';
import './App.css';

function AppContent() {
  const [authMode, setAuthMode] = useState('login');
  const [currentPage, setCurrentPage] = useState('dashboard'); // Nueva navegación
  const { currentUser, setCurrentUser } = useAuth();

  const handleAuthSuccess = () => {
    window.location.reload();
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthMode('login');
    setCurrentPage('dashboard');
  };

  if (currentUser) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', color: 'white' }}>
        {/* Navegación superior */}
        <nav style={{ 
          background: 'rgba(255, 255, 255, 0.1)', 
          padding: '15px 20px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', gap: '20px' }}>
            <button 
              onClick={() => setCurrentPage('dashboard')}
              style={{
                padding: '10px 20px',
                backgroundColor: currentPage === 'dashboard' ? '#ff6b35' : 'transparent',
                color: 'white',
                border: '2px solid #ff6b35',
                borderRadius: '25px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              📊 Dashboard
            </button>
            <button 
              onClick={() => setCurrentPage('garage')}
              style={{
                padding: '10px 20px',
                backgroundColor: currentPage === 'garage' ? '#ff6b35' : 'transparent',
                color: 'white',
                border: '2px solid #ff6b35',
                borderRadius: '25px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              ⚙️ Mi Garage
            </button>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span>Hola, {currentUser.username}!</span>
            <button 
              onClick={handleLogout}
              style={{
                padding: '8px 15px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '15px',
                cursor: 'pointer'
              }}
            >
              Cerrar Sesión
            </button>
          </div>
        </nav>

        {/* Contenido principal */}
        <div>
          {currentPage === 'dashboard' && <Dashboard onLogout={handleLogout} />}
          {currentPage === 'garage' && <Garage />}
        </div>
      </div>
    );
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