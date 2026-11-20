const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export const BACKEND_URL = apiUrl.replace(/\/api\/?$/, '')
