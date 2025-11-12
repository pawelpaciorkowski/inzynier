import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api'
});

api.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        const publicEndpoints = ['/Auth/login', '/Auth/register'];
        const isPublicEndpoint = publicEndpoints.some(endpoint => config.url?.includes(endpoint));
        
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        } else if (!isPublicEndpoint) {
            console.warn('Brak tokenu dla requestu:', config.url);
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            console.error('401 Unauthorized:', error.config?.url);
        }
        return Promise.reject(error);
    }
);

export default api;