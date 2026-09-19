import { createContext, useContext } from "react";

export interface ThemeModeContextType {
  mode: "light" | "dark";
  toggleColorMode: () => void;
}

export const ThemeModeContext = createContext<ThemeModeContextType>({
  mode: "dark",
  toggleColorMode: () => {},
});

export const useThemeMode = () => useContext(ThemeModeContext);
