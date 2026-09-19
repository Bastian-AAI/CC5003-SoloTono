import { useMemo, useState, type ReactNode } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { getAppTheme } from "../theme";
import { ThemeModeContext } from "./themeContext";

interface Props {
  children: ReactNode;
}

export const ThemeModeProvider = ({ children }: Props) => {
  const [mode, setMode] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("solotono_theme_mode");
    return (saved === "light" || saved === "dark") ? saved : "dark";
  });

  const toggleColorMode = () => {
    setMode((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("solotono_theme_mode", next);
      return next;
    });
  };

  const theme = useMemo(() => getAppTheme(mode), [mode]);

  return (
    <ThemeModeContext.Provider value={{ mode, toggleColorMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
};
