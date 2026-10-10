import axios from 'axios'
import type { Credentials, RegisterData, User } from '../types'
import axiosSecure, { CSRF_KEY } from '../utils/axiosSecure'

// Login/registro/logout no necesitan el token CSRF; sí necesitan que el navegador
// guarde/envíe la cookie, por eso withCredentials.
const plain = axios.create({ baseURL:'http://localhost:3001',
                            withCredentials: true })

export const login = async (credentials: Credentials): Promise<User> => {
  const response = await plain.post<User>('/api/auth/login', credentials)
  // El servidor entrega el token CSRF en un header; se guarda en localStorage.
  // El JWT NO pasa por aquí: viaja solo en la cookie httpOnly.
  const csrfToken: unknown = response.headers['x-csrf-token']
  if (typeof csrfToken === 'string') {
    localStorage.setItem(CSRF_KEY, csrfToken)
  }
  return response.data
}

export const register = async (data: RegisterData): Promise<User> => {
  const response = await plain.post<User>('/api/auth/register', data)
  return response.data
}

// Restaura la sesión al cargar la app. null = no hay sesión.
export const restoreLogin = async (): Promise<User | null> => {
  if (!localStorage.getItem(CSRF_KEY)) return null
  try {
    const response = await axiosSecure.get<User>('/api/auth/me')
    return response.data
  } catch {
    return null
  }
}

export const logout = async (): Promise<void> => {
  try {
    await plain.post('/api/auth/logout')
  } finally {
    localStorage.removeItem(CSRF_KEY)
  }
}
