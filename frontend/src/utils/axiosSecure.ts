import axios from 'axios'

export const CSRF_KEY = 'csrfToken'

// Cliente para peticiones autenticadas.
//  - withCredentials: el navegador adjunta la cookie httpOnly con el JWT.
//  - El interceptor agrega el token CSRF (guardado en localStorage al hacer login)
//    en el header X-CSRF-Token. Un sitio atacante puede provocar que el navegador
//    envíe la cookie, pero no puede leer nuestro localStorage ni poner este header.
const axiosSecure = axios.create({ withCredentials: true })

axiosSecure.interceptors.request.use((config) => {
  const csrfToken = localStorage.getItem(CSRF_KEY)
  if (csrfToken) {
    config.headers['X-CSRF-Token'] = csrfToken
  }
  return config
})

// Si la sesión expira (401) en cualquier petición autenticada, se avisa a la app
// para que limpie el estado y redirija a /login.
let onUnauthorized: (() => void) | null = null
export const setUnauthorizedHandler = (handler: (() => void) | null) => {
  onUnauthorized = handler
}

axiosSecure.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem(CSRF_KEY)
      onUnauthorized?.()
    }
    return Promise.reject(error)
  },
)

export default axiosSecure
