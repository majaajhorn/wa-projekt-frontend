import axios from 'axios';

// Create an Axios instance
const apiClient = axios.create({
    baseURL: 'http://localhost:5000', 
    headers: {
        'Content-Type': 'application/json',
    },
});

// Optional: Add interceptors for requests and responses
apiClient.interceptors.request.use(
    (config) => {
        // Example: Add Authorization header with a token if available
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Example: Handle common errors globally
        if (error.response && error.response.status === 401) {
            console.error('Unauthorized, redirecting to login...');
        }
        return Promise.reject(error);
    }
);

export default apiClient;
