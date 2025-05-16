import axios from 'axios';

const API_URL = 'http://localhost:5000/api/simulations';

// Get phishing scenarios
export const getPhishingScenarios = async () => {
  try {
    const response = await axios.get(`${API_URL}/phishing`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Get password scenarios
export const getPasswordScenarios = async () => {
  try {
    const response = await axios.get(`${API_URL}/password`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Get social engineering scenarios
export const getSocialScenarios = async () => {
  try {
    const response = await axios.get(`${API_URL}/social`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Submit phishing response
export const submitPhishingResponse = async (scenarioId, action) => {
  try {
    const response = await axios.post(`${API_URL}/phishing/submit`, {
      scenarioId,
      action
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Submit password response
export const submitPasswordResponse = async (scenarioId, password) => {
  try {
    const response = await axios.post(`${API_URL}/password/submit`, {
      scenarioId,
      password
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Submit social engineering response
export const submitSocialResponse = async (scenarioId, action) => {
  try {
    const response = await axios.post(`${API_URL}/social/submit`, {
      scenarioId,
      action
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};