import axios from 'axios';

// Create an Axios instance
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json', // Default Content-Type for JSON requests
    },
});

// Add interceptors for requests
apiClient.interceptors.request.use(
    (config) => {
        // Add Authorization header dynamically
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Example: Log outgoing requests (optional)
        console.log(`Sending ${config.method} request to: ${config.baseURL}${config.url}`);
        
        return config;
    },
    (error) => {
        console.error('Request Error:', error);
        return Promise.reject(error);
    }
);

// Add interceptors for responses
apiClient.interceptors.response.use(
    (response) => {
        // Simple logging for debugging
        console.log(`Received response from: ${response.config.url}`, response.status);
        return response;
    },
    (error) => {
        // Handle common error responses
        if (error.response) {
            console.error(`API Error: ${error.response.status} from ${error.config?.url}`, 
                         error.response.data);
        } else if (error.request) {
            console.error('Network Error: No response received');
        } else {
            console.error('Error:', error.message);
        }

        return Promise.reject(error);
    }
);

// Utility function for multipart form data (e.g., file uploads)
export const uploadFile = async (url, file, additionalData = {}) => {
    const formData = new FormData();
    formData.append('file', file);

    // Append any additional fields to the form data
    Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
    });

    try {
        const response = await apiClient.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data', // Specify multipart header
            },
        });
        return response.data; // Return the response data
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
};

export default apiClient;
