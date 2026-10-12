import type { ReactNode } from 'react'
import { Box, Container, keyframes, useTheme } from '@mui/material'
import MusicNoteIcon from '@mui/icons-material/MusicNote'
import AudiotrackIcon from '@mui/icons-material/Audiotrack'

import vinyl from '../assets/decor/vinyl.png'
import bassGuitar from '../assets/decor/bass-guitar.png'
import keyboard from '../assets/decor/keyboard.png'
import musicStaff from '../assets/decor/music-staff.png'
import electricGuitar from '../assets/decor/electric-guitar.png'
import drums from '../assets/decor/drums.png'

/* ------------------------------------------------------------------ */
/* Animaciones (se desactivan con prefers-reduced-motion)              */
/* ------------------------------------------------------------------ */

const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`

// Flota suavemente conservando la rotación base (--r) de cada elemento
const float = keyframes`
  0%, 100% { transform: translateY(0) rotate(var(--r)); }
  50%      { transform: translateY(-9px) rotate(calc(var(--r) + 2.5deg)); }
`

const equalizer = keyframes`
  0%, 100% { transform: scaleY(0.45); }
  50%      { transform: scaleY(1); }
`

const reduceMotion = '@media (prefers-reduced-motion: reduce)'

/* ------------------------------------------------------------------ */
/* Composición: cada elemento se posiciona en % del ancho/alto de la   */
/* sección, algunos quedan cortados por el borde, como en las          */
/* diapositivas. Para ajustar la composición, edita estas listas.      */
/* ------------------------------------------------------------------ */

interface DecorImage {
  src: string
  width: string
  rotate: number
  top?: string
  bottom?: string
  left?: string
  right?: string
  spin?: boolean
  duration?: number // segundos
  delay?: number // segundos
}

const IMAGES: DecorImage[] = [
  // Lado izquierdo
  { src: keyboard, width: 'clamp(150px, 15vw, 230px)', rotate: -8, top: '4%', left: '-1%', duration: 8, delay: 0 },
  { src: electricGuitar, width: 'clamp(190px, 19vw, 300px)', rotate: -24, top: '36%', left: '-4%', duration: 9, delay: 1.2 },
  { src: drums, width: 'clamp(180px, 18vw, 280px)', rotate: 2, bottom: '-5%', left: '4%', duration: 10, delay: 0.6 },
  // Lado derecho
  { src: vinyl, width: 'clamp(210px, 21vw, 340px)', rotate: 0, top: '-8%', right: '-5%', spin: true, duration: 28 },
  { src: bassGuitar, width: 'clamp(70px, 7vw, 110px)', rotate: 10, top: '36%', right: '20%', duration: 9, delay: 0.3 },
  { src: musicStaff, width: 'clamp(200px, 19vw, 300px)', rotate: -6, bottom: '3%', right: '1%', duration: 8.5, delay: 1.8 },
]

interface DecorNote {
  Icon: typeof MusicNoteIcon
  size: number
  rotate: number
  accent?: boolean // true = naranja
  top: string
  left?: string
  right?: string
  duration: number
  delay: number
}

const NOTES: DecorNote[] = [
  { Icon: MusicNoteIcon, size: 34, rotate: -14, top: '9%', left: '19%', accent: true, duration: 4.5, delay: 0 },
  { Icon: AudiotrackIcon, size: 28, rotate: 10, top: '66%', left: '19%', duration: 5.5, delay: 1.4 },
  { Icon: AudiotrackIcon, size: 32, rotate: 8, top: '14%', right: '23%', duration: 5, delay: 0.7 },
  { Icon: MusicNoteIcon, size: 38, rotate: -10, top: '63%', right: '7%', accent: true, duration: 4.8, delay: 2.1 },
]

// Alturas (px) de las barras del ecualizador
const BARS = [8, 14, 22, 12, 30, 18, 36, 24, 40, 20, 34, 16, 28, 10, 24, 38, 18, 32, 12, 26]

function Equalizer({ top, left, right }: { top: string; left?: string; right?: string }) {
  return (
    <Box
      sx={{
        position: 'absolute',
        top,
        left,
        right,
        height: 44,
        display: 'flex',
        alignItems: 'center',
        gap: '3px',
        color: 'text.primary',
        opacity: 0.55,
      }}
    >
      {BARS.map((h, i) => (
        <Box
          key={i}
          sx={{
            width: '2px',
            height: h,
            borderRadius: '2px',
            bgcolor: 'currentColor',
            animation: `${equalizer} ${1.1 + (i % 5) * 0.18}s ease-in-out ${i * 0.07}s infinite`,
            [reduceMotion]: { animation: 'none' },
          }}
        />
      ))}
    </Box>
  )
}

/** Capa decorativa: no recibe clics ni la leen los lectores de pantalla. */
function AuthDecor() {
  const isDark = useTheme().palette.mode === 'dark'

  return (
    <Box
      aria-hidden="true"
      sx={{
        // Solo en pantallas con espacio a los lados; en móvil el formulario ocupa todo el ancho
        display: { xs: 'none', md: 'block' },
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      {IMAGES.map((img, i) => (
        <Box
          key={i}
          component="img"
          src={img.src}
          alt=""
          draggable={false}
          sx={{
            '--r': `${img.rotate}deg`,
            position: 'absolute',
            top: img.top,
            bottom: img.bottom,
            left: img.left,
            right: img.right,
            width: img.width,
            height: 'auto',
            transform: 'rotate(var(--r))',
            // Las ilustraciones son negras: en modo oscuro se invierten para que se vean
            filter: isDark ? 'invert(1)' : 'none',
            opacity: isDark ? 0.85 : 1,
            animation: img.spin
              ? `${spin} ${img.duration}s linear infinite`
              : `${float} ${img.duration}s ease-in-out ${img.delay ?? 0}s infinite`,
            [reduceMotion]: { animation: 'none' },
          }}
        />
      ))}

      <Equalizer top="23%" left="3%" />
      <Equalizer top="45%" right="4%" />

      {NOTES.map(({ Icon, size, rotate, accent, top, left, right, duration, delay }, i) => (
        <Icon
          key={i}
          sx={{
            '--r': `${rotate}deg`,
            position: 'absolute',
            top,
            left,
            right,
            fontSize: size,
            color: accent ? 'primary.main' : 'text.primary',
            opacity: accent ? 0.9 : 0.6,
            transform: 'rotate(var(--r))',
            animation: `${float} ${duration}s ease-in-out ${delay}s infinite`,
            [reduceMotion]: { animation: 'none' },
          }}
        />
      ))}
    </Box>
  )
}

/** Contenedor para las páginas de login y registro: formulario centrado + decoración. */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // Ocupa el alto libre entre el Navbar y el Footer (~260px) para que la
        // decoración llegue hasta abajo; nunca menos de 640px.
        minHeight: { md: 'max(640px, calc(100vh - 260px))' },
      }}
    >
      <AuthDecor />
      <Container maxWidth="xs" sx={{ py: 8, position: 'relative', zIndex: 1 }}>
        {children}
      </Container>
    </Box>
  )
}
