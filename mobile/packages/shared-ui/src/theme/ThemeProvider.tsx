import React, { createContext, useContext, type PropsWithChildren } from "react";
import { theme as defaultTheme, type Theme } from "./tokens";

const ThemeContext = createContext<Theme>(defaultTheme);

export function ThemeProvider({ children }: PropsWithChildren): React.JSX.Element {
  return <ThemeContext.Provider value={defaultTheme}>{children}</ThemeContext.Provider>;
}

/** Access Dreem Nest design tokens from any themed component. */
export function useTheme(): Theme {
  return useContext(ThemeContext);
}
