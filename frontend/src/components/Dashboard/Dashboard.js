import React from 'react';
import { logout } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

const Dashboard = ({ onLogout }) => {
  const { currentUser } = useAuth();

  const handleLogout = () => {
    logout();
    onLogout();
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ 
        background: 'linear-gradient(45deg, #ff6b35, #f7931e)', 
        padding: '30px', 
        borderRadius: '15px', 
        color: 'white', 
        textAlign: 'center',
        marginBottom: '30px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
      }}>
        <h1>⚡ BEYBLADE BATTLE ARENA ⚡</h1>
        <p>Bienvenido de vuelta, {currentUser?.username}!</p>
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '25px' 
      }}>
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.95)', 
          padding: '25px', 
          borderRadius: '15px', 
          border: '2px solid rgba(255, 107, 53, 0.3)',
          color: '#333',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          transition: 'transform 0.3s'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0px)'}
        >
          <h3 style={{ color: '#ff6b35', marginBottom: '20px' }}>📊 Estadísticas Generales</h3>
          <div style={{ fontSize: '16px', lineHeight: '1.6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>Victorias:</span>
              <strong style={{ color: '#28a745' }}>{currentUser?.wins || 0}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>Derrotas:</span>
              <strong style={{ color: '#dc3545' }}>{currentUser?.losses || 0}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>Nivel:</span>
              <strong style={{ color: '#ff6b35' }}>{currentUser?.level || 1}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Usuario:</span>
              <strong style={{ color: '#6c757d' }}>{currentUser?.username}</strong>
            </div>
          </div>
        </div>

        <div style={{ 
          background: 'rgba(255, 255, 255, 0.95)', 
          padding: '25px', 
          borderRadius: '15px', 
          border: '2px solid rgba(255, 107, 53, 0.3)',
          color: '#333',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          transition: 'transform 0.3s',
          textAlign: 'center'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0px)'}
        >
          <h3 style={{ color: '#ff6b35', marginBottom: '20px' }}>⚡ Próximas Funciones</h3>
          <div style={{ textAlign: 'left', fontSize: '15px' }}>
            <div style={{ padding: '8px 0', borderBottom: '1px solid #e9ecef' }}>🏆 Sistema de Torneos</div>
            <div style={{ padding: '8px 0', borderBottom: '1px solid #e9ecef' }}>⚔️ Arena de Batalla</div>
            <div style={{ padding: '8px 0', borderBottom: '1px solid #e9ecef' }}>📈 Rankings Globales</div>
            <div style={{ padding: '8px 0' }}>🎯 Misiones Diarias</div>
          </div>
        </div>

        <div style={{ 
          background: 'rgba(255, 255, 255, 0.95)', 
          padding: '25px', 
          borderRadius: '15px', 
          border: '2px solid rgba(255, 107, 53, 0.3)',
          color: '#333',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          transition: 'transform 0.3s'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0px)'}
        >
          <h3 style={{ color: '#ff6b35', marginBottom: '20px' }}>👤 Información de Cuenta</h3>
          <div style={{ fontSize: '15px', lineHeight: '1.6' }}>
            <div style={{ marginBottom: '15px' }}>
              <div style={{ color: '#6c757d', fontSize: '14px' }}>Email:</div>
              <strong>{currentUser?.email}</strong>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <div style={{ color: '#6c757d', fontSize: '14px' }}>ID:</div>
              <strong style={{ fontSize: '12px', fontFamily: 'monospace' }}>{currentUser?.id}</strong>
            </div>
            <button 
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '12px 20px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '16px',
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
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Tarjeta adicional para llenar el espacio */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.95)', 
          padding: '25px', 
          borderRadius: '15px', 
          border: '2px solid rgba(255, 107, 53, 0.3)',
          color: '#333',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          transition: 'transform 0.3s',
          textAlign: 'center'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0px)'}
        >
          <h3 style={{ color: '#ff6b35', marginBottom: '20px' }}>🎮 Inicio Rápido</h3>
          <div>
            <button 
              style={{
                width: '100%',
                padding: '12px 20px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                marginBottom: '10px',
                transition: 'all 0.3s',
                boxShadow: '0 3px 10px rgba(40, 167, 69, 0.3)'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#218838';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#28a745';
                e.target.style.transform = 'translateY(0px)';
              }}
            >
              Ir al Garage
            </button>
            <div style={{ fontSize: '14px', color: '#6c757d', marginTop: '10px' }}>
              Crea y personaliza tus Beyblades
            </div>
          </div>
        </div>

        <div style={{ 
          background: 'rgba(255, 255, 255, 0.95)', 
          padding: '25px', 
          borderRadius: '15px', 
          border: '2px solid rgba(255, 107, 53, 0.3)',
          color: '#333',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          transition: 'transform 0.3s'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0px)'}
        >
          <h3 style={{ color: '#ff6b35', marginBottom: '20px' }}>🏆 Logros Recientes</h3>
          <div style={{ textAlign: 'center' }}>
            {currentUser?.wins > 0 ? (
              <div>
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🥉</div>
                <div style={{ fontWeight: 'bold' }}>Primer Triunfo</div>
                <div style={{ fontSize: '14px', color: '#6c757d' }}>¡Conseguiste tu primera victoria!</div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🎯</div>
                <div style={{ fontWeight: 'bold' }}>Nuevo Guerrero</div>
                <div style={{ fontSize: '14px', color: '#6c757d' }}>¡Comienza tu aventura!</div>
              </div>
            )}
          </div>
        </div>

        <div style={{ 
          background: 'rgba(255, 255, 255, 0.95)', 
          padding: '25px', 
          borderRadius: '15px', 
          border: '2px solid rgba(255, 107, 53, 0.3)',
          color: '#333',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          transition: 'transform 0.3s'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0px)'}
        >
          <h3 style={{ color: '#ff6b35', marginBottom: '20px' }}>📈 Progreso del Día</h3>
          <div>
            <div style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ fontSize: '14px' }}>Experiencia Diaria</span>
                <span style={{ fontSize: '14px', color: '#ff6b35' }}>750/1000 XP</span>
              </div>
              <div style={{ background: '#e9ecef', height: '8px', borderRadius: '4px' }}>
                <div style={{ 
                  background: 'linear-gradient(90deg, #ff6b35, #f7931e)', 
                  height: '100%', 
                  width: '75%', 
                  borderRadius: '4px',
                  transition: 'width 0.5s ease'
                }}></div>
              </div>
            </div>
            
            <div style={{ fontSize: '14px', color: '#6c757d', textAlign: 'center' }}>
              ¡250 XP más para el bonus diario!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;