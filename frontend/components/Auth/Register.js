import { useState } from 'react';
import { register } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

const Register = ({ onSuccess, switchToLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
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
      const response = await register(formData);
      setCurrentUser(response.user);
      onSuccess();
    } catch (error) {
      setError(error.response?.data?.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h2>Crear Cuenta</h2>
      <p>Únete a la arena más épica del mundo</p>
      
      {error && (
        <div style={{ color: 'red', marginBottom: '10px' }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Nombre de Usuario:</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '10px', marginTop: '5px' }}
          />
        </div>
        
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
            minLength={6}
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
          {loading ? 'Creando...' : 'Crear Cuenta'}
        </button>
      </form>
      
      <p style={{ textAlign: 'center', marginTop: '20px' }}>
        ¿Ya tienes cuenta?{' '}
        <button 
          onClick={switchToLogin}
          style={{ background: 'none', border: 'none', color: '#ff6b35', cursor: 'pointer' }}
        >
          Iniciar sesión
        </button>
      </p>
    </div>
  );
};

export default Register;