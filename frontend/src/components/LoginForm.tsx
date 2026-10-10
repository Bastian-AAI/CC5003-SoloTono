import { useState, type FormEvent } from 'react'
import axios from 'axios'
import { useAuth } from '../hooks/useAuth'
import { getErrorMessage } from '../utils/errors'
import { ErrorMessage } from './Message'

interface Props {
  /** Se llama tras un login exitoso (la página de login lo usa para redirigir). */
  onSuccess?: () => void
  /** Disposición horizontal para usarlo dentro de la página principal. */
  inline?: boolean
}

// Formulario de login reutilizable: lo usan la página /login y la página principal.
export function LoginForm({ onSuccess, inline = false }: Props) {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await login({ username, password })
      onSuccess?.()
    } catch (e: unknown) {
      setError(axios.isAxiosError(e) && e.response?.status === 401 ? 'Usuario o contraseña incorrectos.' : getErrorMessage(e))
      setSubmitting(false)
    }
  }

  return (
    <form className={`form${inline ? ' login-inline' : ''}`} onSubmit={handleSubmit}>
      <div className={inline ? 'row' : undefined}>
        <label>
          Usuario
          <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required />
        </label>
        <label>
          Contraseña
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
        </label>
        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? 'Entrando…' : 'Entrar'}
        </button>
      </div>
      <ErrorMessage message={error} />
    </form>
  )
}
