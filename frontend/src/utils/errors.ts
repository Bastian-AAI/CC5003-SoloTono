import axios from 'axios'
import type { ApiErrorBody } from '../types'

// Convierte cualquier error en un mensaje legible en español.
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    if (!error.response) return 'No se pudo conectar con el servidor.'
    const { status, data } = error.response
    const details = data?.details ? Object.values(data.details).join(' ') : ''
    if (details) return details
    switch (status) {
      case 400: return 'Los datos enviados no son válidos.'
      case 401: return 'Tu sesión no es válida. Inicia sesión nuevamente.'
      case 403: return 'No tienes permiso para hacer esto.'
      case 404: return 'El recurso ya no existe.'
      case 409: return 'Ya existe un registro con esos datos.'
      default: return 'Ocurrió un error en el servidor.'
    }
  }
  return 'Ocurrió un error inesperado.'
}
