import { createContext, useContext, useEffect, useState } from 'react'
import { authApi } from '../services/api.js'

const STORAGE_KEY = 'azurestay_user'
const AuthContext = createContext(null)

// Đọc user đã lưu trong localStorage khi mở lại trang (F5 vẫn còn đăng nhập).
function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY))
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser)

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    else localStorage.removeItem(STORAGE_KEY)
  }, [user])

  async function login(email, password) {
    const data = await authApi.login({ email, password })
    setUser(data)
    return data
  }

  async function register(email, password) {
    const data = await authApi.register({ email, password })
    setUser(data) // đăng ký xong đăng nhập luôn
    return data
  }

  function logout() {
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth phải nằm trong <AuthProvider>')
  return ctx
}
