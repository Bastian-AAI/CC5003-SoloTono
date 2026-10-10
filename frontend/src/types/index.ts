export type Role = 'user' | 'moderator'

export interface User {
    id: string
    username: string
    name: string
    role: Role
  }
  
  export interface Credentials {
    username: string
    password: string
  }
  
  export interface RegisterData extends Credentials {
    name: string
  }

  /** Forma de los errores JSON del backend. */
export interface ApiErrorBody {
    error?: string
    details?: Record<string, string>
  }
  