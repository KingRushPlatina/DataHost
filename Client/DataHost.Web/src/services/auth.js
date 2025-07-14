import api from './api'

export const authService = {
  async login(username, password) {
    const response = await api.post('/auth/login', {
      username,
      password,
    })
    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user || { username }))
    }
    return response.data
  },

  async register(username, password, email) {
    const response = await api.post('/auth/register', {
      username,
      password,
      email,
    })
    return response.data
  },

  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  getToken() {
    return localStorage.getItem('token')
  },

  getUser() {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  },

  isAuthenticated() {
    return !!this.getToken()
  }
}