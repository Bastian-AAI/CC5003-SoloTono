import { createTheme, type Theme } from "@mui/material/styles";

export const getAppTheme = (mode: "light" | "dark"): Theme => {
  const isDark = mode === "dark";

  return createTheme({
    palette: {
      mode,
      primary: {
        main: "#ff6f00", // Tono cálido / ámbar musical
        light: "#ffa040",
        dark: "#c43e00",
        contrastText: "#ffffff",
      },
      secondary: {
        main: "#00b0ff", // Azul eléctrico para acentos y badges
        light: "#69e2ff",
        dark: "#0081cb",
        contrastText: "#ffffff",
      },
      background: {
        default: isDark ? "#0f1117" : "#f8fafc",
        paper: isDark ? "#171a23" : "#ffffff",
      },
      text: {
        primary: isDark ? "#f3f4f6" : "#111827",
        secondary: isDark ? "#9ca3af" : "#4b5563",
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
            transition: "transform 140ms cubic-bezier(0.23, 1, 0.32, 1), background-color 140ms ease, box-shadow 140ms ease",
            "@media (hover: hover) and (pointer: fine)": {
              "&:hover": {
                boxShadow: "0 4px 12px rgba(255, 111, 0, 0.25)",
              },
            },
            "&:active:not(:disabled)": {
              transform: "scale(0.97)",
            },
          },
          // Botones con contorno: fondo sólido para que no se vea la cuadrícula
          // de la página por debajo.
          outlined: ({ theme }) => ({
            backgroundColor: theme.palette.background.paper,
            "@media (hover: hover) and (pointer: fine)": {
              "&:hover": {
                backgroundColor: theme.palette.background.paper,
                backgroundImage:
                  "linear-gradient(color-mix(in srgb, currentColor 6%, transparent), color-mix(in srgb, currentColor 6%, transparent))",
              },
            },
          }),
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            transition: "transform 140ms cubic-bezier(0.23, 1, 0.32, 1), background-color 140ms ease",
            "&:active": {
              transform: "scale(0.92)",
            },
          },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            minHeight: 40,
            minWidth: 40,
            transition: "transform 140ms cubic-bezier(0.23, 1, 0.32, 1), background-color 140ms ease",
            "&:active": {
              transform: "scale(0.95)",
            },
          },
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
            transition: "transform 200ms cubic-bezier(0.23, 1, 0.32, 1), box-shadow 200ms cubic-bezier(0.23, 1, 0.32, 1), border-color 200ms ease",
            "@media (hover: hover) and (pointer: fine)": {
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: isDark 
                  ? "0 12px 24px -10px rgba(0, 0, 0, 0.6)" 
                  : "0 12px 24px -10px rgba(0, 0, 0, 0.12)",
              },
            },
            "&:active": {
              transform: "scale(0.99)",
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
            color: isDark ? "#f3f4f6" : "#111827",
            backgroundColor: isDark ? "rgba(15, 17, 23, 0.85)" : "rgba(255, 255, 255, 0.85)",
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
 *  - Modo claro : hoja clara con líneas gris oscuro, suaves para no competir con el texto.
 *  - Modo oscuro: hoja negra con líneas gris claro.
 * Se usa solo en el <main>, así el Navbar y el Footer no cambian.
 * Para ajustarlo: GRID_SIZE cambia el tamaño del cuadro y las constantes de
 * color/opacidad cambian qué tan marcadas se ven las líneas.
 */
const GRID_SIZE = 24; // px por cuadro

export const getNotebookBackground = (mode: "light" | "dark") => {
  const isDark = mode === "dark";

  const paper = isDark ? "#0b0b0d" : "#f7f6f2";
  const line = isDark ? "rgba(209, 213, 219, 0.12)" : "rgba(55, 65, 81, 0.17)";

  return {
    backgroundColor: paper,
    backgroundImage: [
      `linear-gradient(to right, ${line} 1px, transparent 1px)`,
      `linear-gradient(to bottom, ${line} 1px, transparent 1px)`,
    ].join(", "),
    backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
  };
};
