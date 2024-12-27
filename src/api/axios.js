import axios from 'axios';

// Create an Axios instance
const apiClient = axios.create({
    baseURL: 'http://localhost:5000', // Replace with your backend's base URL
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
        console.log(`Outgoing Request: ${config.method.toUpperCase()} ${config.url}`, config);
        
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
        // Log the response (optional)
        console.log(`Response:`, response);
        return response;
    },
    (error) => {
        // Handle common error responses globally
        if (error.response) {
            const { status, data } = error.response;
            
            // Example: Handle 401 Unauthorized globally
            if (status === 401) {
                console.error('Unauthorized: Redirecting to login...');
                // Optionally, redirect to login page
                window.location.href = '/login';
            }

            // Example: Handle 500 Internal Server Error
            if (status === 500) {
                console.error('Server Error:', data?.message || 'An error occurred on the server.');
            }
        } else if (error.request) {
            // Handle network errors
            console.error('Network Error: No response received from server.', error.request);
        } else {
            // Handle unexpected errors
            console.error('Unexpected Error:', error.message);
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
