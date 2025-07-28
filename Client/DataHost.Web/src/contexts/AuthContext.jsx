import React, { createContext, useState, useContext, useEffect } from 'react'
import { authService } from '../services/auth'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = authService.getToken()
    const savedUser = authService.getUser()
    if (token && savedUser) {
      setUser({ ...savedUser, token })
    }
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    const data = await authService.login(username, password)
    const userInfo = data.user || { username, role: 'user' }
    setUser({ ...userInfo, token: data.token })
    return data
  }

  const register = async (username, password, email) => {
    const data = await authService.register(username, password, email)
    if (data.token && data.user) {
      setUser({ ...data.user, token: data.token })
    }
    return data
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  const isAdmin = () => {
    return user?.role === 'admin'
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}