import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Obtener token del localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

// ========== INVENTARIO ==========

export const getInventory = async () => {
  const response = await axios.get(`${API_URL}/inventory`, getAuthHeader());
  return response.data;
};

export const addToInventory = async (type, name, quantity = 1) => {
  const response = await axios.post(
    `${API_URL}/inventory/add`,
    { type, name, quantity },
    getAuthHeader()
  );
  return response.data;
};

export const removeFromInventory = async (type, name, quantity = 1) => {
  const response = await axios.post(
    `${API_URL}/inventory/remove`,
    { type, name, quantity },
    getAuthHeader()
  );
  return response.data;
};

export const checkInventoryAvailability = async (blade, ratchet, bit) => {
  const response = await axios.post(
    `${API_URL}/inventory/check`,
    { blade, ratchet, bit },
    getAuthHeader()
  );
  return response.data;
};

// ========== WISHLIST ==========

export const getWishlist = async () => {
  const response = await axios.get(`${API_URL}/wishlist`, getAuthHeader());
  return response.data;
};

export const addToWishlist = async (type, name, priority = 'medium') => {
  const response = await axios.post(
    `${API_URL}/wishlist/add`,
    { type, name, priority },
    getAuthHeader()
  );
  return response.data;
};

export const removeFromWishlist = async (itemId) => {
  const response = await axios.delete(
    `${API_URL}/wishlist/remove/${itemId}`,
    getAuthHeader()
  );
  return response.data;
};

export const updateWishlistPriority = async (itemId, priority) => {
  const response = await axios.patch(
    `${API_URL}/wishlist/priority/${itemId}`,
    { priority },
    getAuthHeader()
  );
  return response.data;
};