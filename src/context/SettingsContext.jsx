import { createContext, useEffect, useState } from "react";

// Context and provider intentionally share this file.
// eslint-disable-next-line react-refresh/only-export-components
export const SettingsContext = createContext({
  displayName: "Sounava",
  setDisplayName: () => {},
});

export function SettingsProvider({ children }) {
  const [displayName, setDisplayName] = useState(() => {
    const savedName = localStorage.getItem("focusflow-display-name");

    return savedName?.trim() || "Sounava";
  });

  useEffect(() => {
    const normalizedName =
      typeof displayName === "string" ? displayName.trim() : "";

    localStorage.setItem("focusflow-display-name", normalizedName || "Sounava");
  }, [displayName]);

  return (
    <SettingsContext.Provider
      value={{
        displayName,
        setDisplayName,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}
