// Import your existing apiClient instead of creating a new axios instance
import apiClient from '../api/axios';

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