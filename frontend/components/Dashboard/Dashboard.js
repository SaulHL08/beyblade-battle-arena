import { logout } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

const Dashboard = ({ onLogout }) => {
  const { currentUser } = useAuth();

  const handleLogout = () => {
    logout();
    onLogout();
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ 
        background: 'linear-gradient(45deg, #ff6b35, #f7931e)', 
        padding: '30px', 
        borderRadius: '15px', 
        color: 'white', 
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        <h1>⚡ BEYBLADE BATTLE ARENA ⚡</h1>
        <p>Bienvenido de vuelta, {currentUser?.username}!</p>
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px' 
      }}>
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.1)', 
          padding: '20px', 
          borderRadius: '15px', 
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backgroundColor: '#f8f9fa'
        }}>
          <h3>📊 Estadísticas Generales</h3>
          <div>Victorias: <strong>{currentUser?.wins || 0}</strong></div>
          <div>Derrotas: <strong>{currentUser?.losses || 0}</strong></div>
          <div>Nivel: <strong>{currentUser?.level || 1}</strong></div>
          <div>Usuario: <strong>{currentUser?.username}</strong></div>
        </div>

        <div style={{ 
          background: 'rgba(255, 255, 255, 0.1)', 
          padding: '20px', 
          borderRadius: '15px', 
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backgroundColor: '#f8f9fa'
        }}>
          <h3>⚡ Próximas Funciones</h3>
          <div>🏆 Sistema de Torneos</div>
          <div>⚙️ Mi Garage de Beyblades</div>
          <div>⚔️ Arena de Batalla</div>
          <div>📈 Rankings Globales</div>
        </div>

        <div style={{ 
          background: 'rgba(255, 255, 255, 0.1)', 
          padding: '20px', 
          borderRadius: '15px', 
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backgroundColor: '#f8f9fa'
        }}>
          <h3>👤 Información de Cuenta</h3>
          <div>Email: <strong>{currentUser?.email}</strong></div>
          <div>ID: <strong>{currentUser?.id}</strong></div>
          <button 
            onClick={handleLogout}
            style={{
              marginTop: '15px',
              padding: '10px 20px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;