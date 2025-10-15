import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // cookies enviados em todas requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== "/login") {
      // Só redireciona se não estiver já em /login
      window.location.href = '/login';
    } else if (error.response) {
      console.error('[API] Erro de resposta:', error.response.status, error.response.data);
    } else {
      console.error('[API] Erro sem resposta:', error);
    }
    return Promise.reject(error);
  },
);