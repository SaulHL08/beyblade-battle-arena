import api from './api';

// Obtener todos los torneos
export const getAllTournaments = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await api.get(`/tournaments?${params}`);
  return response.data;
};

// Obtener un torneo específico
export const getTournament = async (id) => {
  const response = await api.get(`/tournaments/${id}`);
  return response.data;
};

// Crear nuevo torneo
export const createTournament = async (formData) => {
  const response = await api.post('/tournaments', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

// Actualizar torneo
export const updateTournament = async (id, formData) => {
  const response = await api.put(`/tournaments/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

// Eliminar torneo
export const deleteTournament = async (id) => {
  const response = await api.delete(`/tournaments/${id}`);
  return response.data;
};

// Unirse a torneo
export const joinTournament = async (id) => {
  const response = await api.post(`/tournaments/${id}/join`);
  return response.data;
};

// Salir de torneo
export const leaveTournament = async (id) => {
  const response = await api.post(`/tournaments/${id}/leave`);
  return response.data;
};