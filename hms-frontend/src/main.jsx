import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Global Fetch Interceptor to handle JWT tokens automatically
const { fetch: originalFetch } = window;
window.fetch = async (...args) => {
    let [resource, config] = args;
    
    // Only intercept requests to our local backend
    if (typeof resource === 'string' && (resource.includes('localhost:8000') || resource.includes('127.0.0.1:8000'))) {
        const token = localStorage.getItem('token');
        if (token) {
            config = config || {};
            config.headers = {
                ...config.headers,
                'Authorization': `Bearer ${token}`
            };
        }
    }
    
    const response = await originalFetch(resource, config);
    
    // Auto-logout on 401 Unauthorized
    if (response.status === 401 && !resource.includes('/api/auth/login')) {
        localStorage.removeItem('token');
        window.location.href = '/';
    }
    
    return response;
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
