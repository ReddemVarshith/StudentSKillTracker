// Centralized API configuration
// Automatically uses the current host so it works both locally and on Render
const API_BASE_URL = (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost')
    ? 'http://127.0.0.1:8000/api'
    : window.location.origin + '/api';

const api = {
    baseUrl: API_BASE_URL,

    // Utility for handling fetch requests with auth headers
    async request(endpoint, options = {}) {
        const token = localStorage.getItem('sst_token');
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (token) {
            headers['Authorization'] = `Token ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            throw new Error(data?.error || data?.detail || 'Something went wrong');
        }

        return data;
    },

    // Auth endpoints
    async login(username, password) {
        return this.request('/auth/login/', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
    },

    async register(username, password) {
        return this.request('/auth/register/', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
    },

    // Profile Endpoints
    async getMe() {
        return this.request('/me/', { method: 'GET' });
    },

    async updateMe(profileData) {
        return this.request('/me/', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    },

    // Aggregated Stats
    async getAggregatedStats(queryUrl) {
        return this.request(`/profile/${queryUrl}`, { method: 'GET' });
    }
};
