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
            "&:hover": {
              boxShadow: "0 4px 12px rgba(255, 111, 0, 0.25)",
            },
          },
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
                ? "0 12px 24px -10px rgba(0, 0, 0, 0.6)" 
                : "0 12px 24px -10px rgba(0, 0, 0, 0.12)",
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
