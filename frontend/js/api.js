/**
 * Personal Operating System - API Client
 * Handles all communication with the backend.
 */

const API_BASE = '/api';

class API {
    /**
     * Make a fetch request with error handling.
     */
    async request(endpoint, options = {}) {
        const url = `${API_BASE}${endpoint}`;

        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Include cookies
        };

        const response = await fetch(url, { ...defaultOptions, ...options });

        if (response.status === 401) {
            // Auth disabled - just log the error
            console.warn('401 received but auth is disabled');
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Request failed');
        }

        return data;
    }

    // --- Auth ---

    async getAuthStatus() {
        return this.request('/auth/status');
    }

    async setup(password) {
        return this.request('/auth/setup', {
            method: 'POST',
            body: JSON.stringify({ password }),
        });
    }

    async login(password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ password }),
        });
    }

    async logout() {
        return this.request('/auth/logout', {
            method: 'POST',
        });
    }

    // --- Journal ---

    async createEntry(date, metrics, content) {
        return this.request('/journal/entry', {
            method: 'POST',
            body: JSON.stringify({ date, metrics, content }),
        });
    }

    async getEntry(date) {
        return this.request(`/journal/entry/${date}`);
    }

    async updateEntry(date, data) {
        return this.request(`/journal/entry/${date}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async lockEntry(date) {
        return this.request(`/journal/entry/${date}/lock`, {
            method: 'POST',
        });
    }

    async listEntries(start = null, end = null, limit = 30) {
        const params = new URLSearchParams({ limit });
        if (start) params.append('start', start);
        if (end) params.append('end', end);
        return this.request(`/journal/entries?${params}`);
    }

    // --- Analytics ---

    async getDashboard(days = 30) {
        return this.request(`/analytics/dashboard?days=${days}`);
    }

    async getStreak() {
        return this.request('/analytics/streak');
    }

    async getTrends(days = 30) {
        return this.request(`/analytics/trends?days=${days}`);
    }
}

// Global API instance
const api = new API();
