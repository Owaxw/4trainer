import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

// Set auth token for all requests
const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Register user
export const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData);
    const { token, user } = response.data;
    
    // Save token to local storage
    localStorage.setItem('token', token);
    setAuthToken(token);
    
    return user;
  } catch (error) {
    throw error.response.data;
  }
};

// Login user
export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    const { token, user } = response.data;
    
    // Save token to local storage
    localStorage.setItem('token', token);
    setAuthToken(token);
    
    return user;
  } catch (error) {
    throw error.response.data;
  }
};

// Logout user
export const logout = () => {
  // Remove token from local storage
  localStorage.removeItem('token');
  setAuthToken(null);
};

// Get current user
export const getCurrentUser = async () => {
  try {
    // Set token if exists in local storage
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }
    
    setAuthToken(token);
    
    const response = await axios.get(`${API_URL}/current`);
    return response.data;
  } catch (error) {
    localStorage.removeItem('token');
    setAuthToken(null);
    throw error.response?.data || error;
  }
};

// Update user
export const updateUser = async (userData) => {
  try {
    const response = await axios.put(`${API_URL}/update`, userData);
    return response.data.user;
  } catch (error) {
    throw error.response.data;
  }
};