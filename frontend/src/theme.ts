import { createTheme, type Theme } from "@mui/material/styles";

export const getAppTheme = (mode: "light" | "dark"): Theme => {
  const isDark = mode === "dark";

  return createTheme({
    palette: {
      mode,
      primary: {
        main: "#6366f1", // Índigo eléctrico moderno (Studio Pro)
        light: "#818cf8",
        dark: "#4f46e5",
        contrastText: "#ffffff",
      },
      secondary: {
        main: "#f59e0b", // Ámbar / Oro cálido para mejores ofertas, ratings y acentos
        light: "#fbbf24",
        dark: "#d97706",
        contrastText: "#ffffff",
      },
      background: {
        default: isDark ? "#0a0e1a" : "#f8fafc",
        paper: isDark ? "#121826" : "#ffffff",
      },
      text: {
        primary: isDark ? "#f1f5f9" : "#0f172a",
        secondary: isDark ? "#94a3b8" : "#475569",
      },
    },
    typography: {
      fontFamily: [
        "-apple-system",
        "BlinkMacSystemFont",
        '"Segoe UI"',
        "Roboto",
        '"Helvetica Neue"',
        "Arial",
        "sans-serif",
      ].join(","),
      h1: {
        fontWeight: 800,
        letterSpacing: "-0.02em",
      },
      h2: {
        fontWeight: 700,
        letterSpacing: "-0.01em",
      },
      h3: {
        fontWeight: 700,
      },
      h4: {
        fontWeight: 700,
      },
      h5: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
      },
      button: {
        textTransform: "none",
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            padding: "8px 18px",
            boxShadow: "none",
            "&:hover": {
              boxShadow: "0 4px 12px rgba(99, 102, 241, 0.28)",
            },
          },
          // Botones con contorno: fondo sólido para que no se vea la cuadrícula
          // de la página por debajo.
          outlined: ({ theme }) => ({
            backgroundColor: theme.palette.background.paper,
            "&:hover": {
              // MUI pinta el hover con un tinte translúcido; lo ponemos como
              // capa encima del fondo sólido para que siga siendo opaco.
              backgroundColor: theme.palette.background.paper,
              backgroundImage:
                "linear-gradient(color-mix(in srgb, currentColor 6%, transparent), color-mix(in srgb, currentColor 6%, transparent))",
            },
          }),
        },
      },
      // Chips con contorno (p. ej. filtros activos del catálogo): mismo criterio.
      MuiChip: {
        styleOverrides: {
          outlined: ({ theme }) => ({
            backgroundColor: theme.palette.background.paper,
          }),
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            backgroundImage: "none",
            border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: isDark 
                ? "0 12px 24px -10px rgba(0, 0, 0, 0.7)" 
                : "0 12px 24px -10px rgba(99, 102, 241, 0.15)",
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            // AppBar usa color="primary" por defecto (texto blanco). Como el fondo
            // es translúcido y cambia con el modo, forzamos el color de texto del
            // tema para que lo que use color="inherit" sea legible en claro y oscuro.
            color: isDark ? "#f1f5f9" : "#0f172a",
            backgroundColor: isDark ? "rgba(10, 14, 26, 0.85)" : "rgba(255, 255, 255, 0.85)",
            backdropFilter: "blur(12px)",
            borderBottom: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)",
            boxShadow: "none",
          },
        },
      },
    },
  });
};

/**
 * Fondo de "cuaderno cuadriculado" para el contenido de la página.
 *  - Modo claro : hoja clara con líneas gris pizarra suaves.
 *  - Modo oscuro: hoja azul noche/carbón con líneas índigo ultra sutiles.
 * Se usa solo en el <main>, así el Navbar y el Footer no cambian.
 * Para ajustarlo: GRID_SIZE cambia el tamaño del cuadro y las constantes de
 * color/opacidad cambian qué tan marcadas se ven las líneas.
 */
const GRID_SIZE = 24; // px por cuadro

export const getNotebookBackground = (mode: "light" | "dark") => {
  const isDark = mode === "dark";

  const paper = isDark ? "#080c16" : "#f8fafc";
  const line = isDark ? "rgba(99, 102, 241, 0.08)" : "rgba(100, 116, 139, 0.12)";

  return {
    backgroundColor: paper,
    backgroundImage: [
      `linear-gradient(to right, ${line} 1px, transparent 1px)`,
      `linear-gradient(to bottom, ${line} 1px, transparent 1px)`,
    ].join(", "),
    backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
  };
};
