import axios from 'axios';

const API_URL = '/api/garage';

// Configurar interceptor para agregar token automáticamente
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Obtener todos los Beyblades del usuario
export const getUserBeyblades = async () => {
  const response = await axios.get(API_URL, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Crear nuevo Beyblade
export const createBeyblade = async (beybladeData) => {
  const response = await axios.post(API_URL, beybladeData, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Eliminar Beyblade
export const deleteBeyblade = async (beybladeId) => {
  const response = await axios.delete(`${API_URL}/${beybladeId}`, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Obtener componentes disponibles
export const getComponents = async () => {
  const response = await axios.get(`${API_URL}/components`);
  return response.data;
};