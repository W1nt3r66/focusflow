import { createContext, useEffect, useState } from "react";

// Context and provider intentionally share this file.
// eslint-disable-next-line react-refresh/only-export-components
export const ThemeContext = createContext({
  theme: "system",
  setTheme: () => {},
});

const validThemes = ["light", "dark", "system"];

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("focusflow-theme");

    return validThemes.includes(savedTheme) ? savedTheme : "system";
  });

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    function applyTheme() {
      const appliedTheme =
        theme === "system" ? (mediaQuery.matches ? "dark" : "light") : theme;

      root.setAttribute("data-theme", appliedTheme);
    }

    applyTheme();
    localStorage.setItem("focusflow-theme", theme);

    if (theme === "system") {
      mediaQuery.addEventListener("change", applyTheme);
    }

    return () => {
      mediaQuery.removeEventListener("change", applyTheme);
    };
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
