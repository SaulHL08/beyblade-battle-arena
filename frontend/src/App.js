import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import Garage from './components/Garage/Garage';
import Profile from './components/Profile/Profile';
import './App.css';

function AppContent() {
  const [authMode, setAuthMode] = useState('login');
  const [currentPage, setCurrentPage] = useState('dashboard');
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
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
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
                fontWeight: 'bold',
                transition: 'all 0.3s',
                boxShadow: currentPage === 'dashboard' ? '0 5px 15px rgba(255, 107, 53, 0.3)' : 'none'
              }}
              onMouseOver={(e) => {
                if (currentPage !== 'dashboard') {
                  e.target.style.backgroundColor = 'rgba(255, 107, 53, 0.2)';
                }
              }}
              onMouseOut={(e) => {
                if (currentPage !== 'dashboard') {
                  e.target.style.backgroundColor = 'transparent';
                }
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
                fontWeight: 'bold',
                transition: 'all 0.3s',
                boxShadow: currentPage === 'garage' ? '0 5px 15px rgba(255, 107, 53, 0.3)' : 'none'
              }}
              onMouseOver={(e) => {
                if (currentPage !== 'garage') {
                  e.target.style.backgroundColor = 'rgba(255, 107, 53, 0.2)';
                }
              }}
              onMouseOut={(e) => {
                if (currentPage !== 'garage') {
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
            >
              ⚙️ Mi Garage
            </button>

            <button 
              onClick={() => setCurrentPage('profile')}
              style={{
                padding: '10px 20px',
                backgroundColor: currentPage === 'profile' ? '#ff6b35' : 'transparent',
                color: 'white',
                border: '2px solid #ff6b35',
                borderRadius: '25px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'all 0.3s',
                boxShadow: currentPage === 'profile' ? '0 5px 15px rgba(255, 107, 53, 0.3)' : 'none'
              }}
              onMouseOver={(e) => {
                if (currentPage !== 'profile') {
                  e.target.style.backgroundColor = 'rgba(255, 107, 53, 0.2)';
                }
              }}
              onMouseOut={(e) => {
                if (currentPage !== 'profile') {
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
            >
              👤 Mi Perfil
            </button>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ 
              padding: '8px 15px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <span style={{ fontSize: '14px' }}>👋 Hola, <strong>{currentUser.username}</strong>!</span>
            </div>
            <button 
              onClick={handleLogout}
              style={{
                padding: '8px 15px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '15px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                transition: 'all 0.3s',
                boxShadow: '0 3px 10px rgba(220, 53, 69, 0.3)'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#c82333';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#dc3545';
                e.target.style.transform = 'translateY(0px)';
              }}
            >
              🚪 Cerrar Sesión
            </button>
          </div>
        </nav>

        {/* Contenido principal */}
        <div style={{ minHeight: 'calc(100vh - 70px)' }}>
          {currentPage === 'dashboard' && <Dashboard onLogout={handleLogout} onNavigate={setCurrentPage} />}
          {currentPage === 'garage' && <Garage />}
          {currentPage === 'profile' && <Profile />}
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