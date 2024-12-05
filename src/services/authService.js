import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000', // Replace with your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to handle login
export const loginUser = async ({ email, password, role }) => {
  try {
    const response = await apiClient.post('/auth/login', { email, password, role });
    return response;
  } catch (error) {
    throw error;
  }
};

// Function to handle registration
export const registerUser = async ({ fullName, email, password, role }) => {
  try {
    const response = await apiClient.post('/auth/register', { fullName, email, password, role });
    return response;
  } catch (error) {
    throw error;
  }
};
