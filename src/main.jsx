import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import CloudBackup from "./components/CloudBackup";
import { ActivityProvider } from "./context/ActivityContext";
import { GoalsProvider } from "./context/GoalsContext";
import { SettingsProvider } from "./context/SettingsContext";
import { ThemeProvider } from "./context/ThemeContext";

import "./theme.css";
import "./index.css";
import "./registerServiceWorker";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <SettingsProvider>
        <ActivityProvider>
          <GoalsProvider>
            <BrowserRouter>
              <CloudBackup />
              <App />
            </BrowserRouter>
          </GoalsProvider>
        </ActivityProvider>
      </SettingsProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
