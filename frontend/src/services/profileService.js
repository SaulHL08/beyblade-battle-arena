import axios from 'axios';

const API_URL = '/api/profile';

// Configurar interceptor para agregar token automáticamente
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Obtener perfil completo del usuario actual
export const getProfile = async () => {
  const response = await axios.get(API_URL, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Obtener perfil público de otro usuario
export const getPublicProfile = async (username) => {
  const response = await axios.get(`${API_URL}/public/${username}`);
  return response.data;
};

// Actualizar información del perfil
export const updateProfile = async (profileData) => {
  const response = await axios.put(API_URL, profileData, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Subir imagen de perfil
export const uploadProfileImage = async (formData) => {
  const response = await axios.post(`${API_URL}/upload-profile-image`, formData, {
    headers: {
      ...getAuthHeader(),
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

// Subir imagen de portada
export const uploadCoverImage = async (formData) => {
  const response = await axios.post(`${API_URL}/upload-cover-image`, formData, {
    headers: {
      ...getAuthHeader(),
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};