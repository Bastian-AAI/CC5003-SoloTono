import { createContext } from 'react'
import type { Credentials, RegisterData, User } from '../types'

export interface AuthContextValue {
  user: User | null
  /** true mientras se restaura la sesión al cargar la app. */
  loading: boolean
  login: (credentials: Credentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
