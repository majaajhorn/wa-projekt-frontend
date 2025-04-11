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

// Function to request password reset
export const requestPasswordReset = async (email) => {
  try {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response;
  } catch (error) {
    throw error;
  }
};

// Function to change password
export const changePassword = async ({ currentPassword, newPassword }) => {
  try {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    // Set authorization header
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    const response = await apiClient.post('/auth/change-password', { 
      currentPassword, 
      newPassword 
    });
    
    return response;
  } catch (error) {
    throw error;
  }
};