import { useState } from 'react';
import { login } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

const Login = ({ onSuccess, switchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setCurrentUser } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await login(formData);
      setCurrentUser(response.user);
      onSuccess();
    } catch (error) {
      setError(error.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h2>Iniciar Sesión</h2>
      <p>Accede a tu cuenta de Battle Arena</p>
      
      {error && (
        <div style={{ color: 'red', marginBottom: '10px' }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '10px', marginTop: '5px' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label>Contraseña:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '10px', marginTop: '5px' }}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: '12px', 
            backgroundColor: '#ff6b35', 
            color: 'white', 
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Iniciando...' : 'Iniciar Sesión'}
        </button>
      </form>
      
      <p style={{ textAlign: 'center', marginTop: '20px' }}>
        ¿No tienes cuenta?{' '}
        <button 
          onClick={switchToRegister}
          style={{ background: 'none', border: 'none', color: '#ff6b35', cursor: 'pointer' }}
        >
          Crear cuenta
        </button>
      </p>
    </div>
  );
};

export default Login;