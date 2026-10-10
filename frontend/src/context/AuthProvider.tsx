import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import * as authApi from '../api/auth'
import type { Credentials, RegisterData, User } from '../types'
import { setUnauthorizedHandler } from '../utils/axiosSecure'
import { AuthContext, type AuthContextValue } from './AuthContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // El estado de sesión se deriva del backend (/auth/me) al montar la app.
  useEffect(() => {
    let cancelled = false
    authApi.restoreLogin().then((restored) => {
      if (!cancelled) {
        setUser(restored)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  // Si cualquier petición recibe 401 (sesión expirada), se limpia el usuario
  // y ProtectedRoute redirige a /login.
  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null))
    return () => setUnauthorizedHandler(null)
  }, [])

  const login = useCallback(async (credentials: Credentials) => {
    setUser(await authApi.login(credentials))
  }, [])

  const register = useCallback(async (data: RegisterData) => {
    await authApi.register(data)
    setUser(await authApi.login({ username: data.username, password: data.password }))
  }, [])

  const logout = useCallback(async () => {
    await authApi.logout()
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
