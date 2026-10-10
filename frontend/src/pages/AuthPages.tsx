import { useState, type FormEvent } from 'react'
import { Link as RouterLink, Navigate, useLocation, useNavigate } from 'react-router-dom'
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  Paper,
} from '@mui/material'
import MusicNoteIcon from '@mui/icons-material/MusicNote'
import axios from 'axios'
import { useAuth } from '../hooks/useAuth'
import { getErrorMessage } from '../utils/errors'

interface LocationState {
  from?: string
}

function useAfterLoginPath(): string {
  const location = useLocation()
  const state = location.state as LocationState | null
  return state?.from && state.from !== '/login' ? state.from : '/catalogo'
}

export function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const target = useAfterLoginPath()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (user) return <Navigate to={target} replace />

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await login({ username, password })
      navigate(target, { replace: true })
    } catch (e: unknown) {
      setError(
        axios.isAxiosError(e) && e.response?.status === 401
          ? 'Usuario o contraseña incorrectos.'
          : getErrorMessage(e)
      )
      setSubmitting(false)
    }
  }

  return (
    <Container maxWidth="xs" sx={{ py: 8 }}>
      <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #ff6f00 0%, #ff8f00 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 10px rgba(255, 111, 0, 0.35)',
              mb: 1.5,
            }}
          >
            <MusicNoteIcon fontSize="large" />
          </Box>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 800 }}>
            Solo<span style={{ color: '#ff6f00' }}>Tono</span>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Inicia sesión para comparar precios
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
            fullWidth
          />
          <TextField
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            fullWidth
          />

          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
            fullWidth
            sx={{
              py: 1.2,
              fontWeight: 700,
              bgcolor: '#ff6f00',
              '&:hover': { bgcolor: '#e66400' },
              mt: 1,
            }}
          >
            {submitting ? 'Entrando…' : 'Entrar'}
          </Button>

          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
            ¿No tienes cuenta?{' '}
            <RouterLink to="/register" style={{ color: '#ff6f00', textDecoration: 'none', fontWeight: 600 }}>
              Regístrate
            </RouterLink>
          </Typography>
        </Box>
      </Paper>
    </Container>
  )
}

export function RegisterPage() {
  const { user, register } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (user) return <Navigate to="/catalogo" replace />

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await register({ username, name, password })
      navigate('/catalogo', { replace: true })
    } catch (e: unknown) {
      setError(getErrorMessage(e))
      setSubmitting(false)
    }
  }

  return (
    <Container maxWidth="xs" sx={{ py: 8 }}>
      <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #ff6f00 0%, #ff8f00 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 10px rgba(255, 111, 0, 0.35)',
              mb: 1.5,
            }}
          >
            <MusicNoteIcon fontSize="large" />
          </Box>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 800 }}>
            Crear cuenta
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Únete a SoloTono
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
            fullWidth
          />
          <TextField
            label="Nombre completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            fullWidth
          />
          <TextField
            label="Contraseña (mín. 8 caracteres)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            fullWidth
          />

          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
            fullWidth
            sx={{
              py: 1.2,
              fontWeight: 700,
              bgcolor: '#ff6f00',
              '&:hover': { bgcolor: '#e66400' },
              mt: 1,
            }}
          >
            {submitting ? 'Creando…' : 'Registrarme'}
          </Button>

          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
            ¿Ya tienes cuenta?{' '}
            <RouterLink to="/login" style={{ color: '#ff6f00', textDecoration: 'none', fontWeight: 600 }}>
              Inicia sesión
            </RouterLink>
          </Typography>
        </Box>
      </Paper>
    </Container>
  )
}