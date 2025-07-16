import axios from 'axios'

const API_BASE_URL = 'http://localhost:4300/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5 minuti di timeout globale
  maxContentLength: 1024 * 1024 * 1024, // 1GB
  maxBodyLength: 1024 * 1024 * 1024, // 1GB
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default api