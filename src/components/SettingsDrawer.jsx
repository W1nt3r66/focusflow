import { useContext } from "react";
import {
  Bell,
  Download,
  Info,
  Monitor,
  Moon,
  Sun,
  UserRound,
  X,
} from "lucide-react";

import { ThemeContext } from "../context/ThemeContext";
import { SettingsContext } from "../context/SettingsContext";
import "./SettingsDrawer.css";

function SettingsDrawer({ isOpen, onClose }) {
  const { theme, setTheme } = useContext(ThemeContext);
  const { displayName, setDisplayName } = useContext(SettingsContext);

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div className="settings-overlay" onClick={onClose}></div>

      <aside className="settings-drawer">
        <div className="settings-header">
          <div>
            <p>FocusFlow</p>
            <h2>Settings</h2>
          </div>

          <button
            type="button"
            className="settings-close"
            onClick={onClose}
            aria-label="Close settings"
          >
            <X size={21} />
          </button>
        </div>

        <div className="settings-content">
          <section className="settings-section">
            <div className="settings-section-heading">
              <h3>Appearance</h3>
              <p>Choose how FocusFlow looks.</p>
            </div>

            <div className="theme-options">
              <button
                type="button"
                className={`theme-option ${
                  theme === "light" ? "selected" : ""
                }`}
                onClick={() => setTheme("light")}
              >
                <Sun size={19} />

                <span>
                  <strong>Light</strong>
                  <small>Pastel light appearance</small>
                </span>
              </button>

              <button
                type="button"
                className={`theme-option ${theme === "dark" ? "selected" : ""}`}
                onClick={() => setTheme("dark")}
              >
                <Moon size={19} />

                <span>
                  <strong>Dark</strong>
                  <small>Dark bluish appearance</small>
                </span>
              </button>

              <button
                type="button"
                className={`theme-option ${
                  theme === "system" ? "selected" : ""
                }`}
                onClick={() => setTheme("system")}
              >
                <Monitor size={19} />

                <span>
                  <strong>System</strong>
                  <small>Follow your device setting</small>
                </span>
              </button>
            </div>
          </section>

          <section className="settings-section">
            <div className="settings-section-heading">
              <h3>Personalization</h3>
              <p>Choose the name shown in your greeting.</p>
            </div>

            <label className="display-name-field" htmlFor="display-name">
              <UserRound size={19} />

              <input
                id="display-name"
                type="text"
                value={displayName}
                maxLength={30}
                placeholder="Your display name"
                onChange={(event) => setDisplayName(event.target.value)}
              />
            </label>
          </section>

          <section className="settings-section">
            <div className="settings-section-heading">
              <h3>Notifications</h3>
              <p>Reminder controls will be added later.</p>
            </div>

            <div className="settings-row disabled-row">
              <Bell size={19} />

              <div>
                <strong>Activity reminders</strong>
                <small>Coming soon</small>
              </div>
            </div>
          </section>

          <section className="settings-section">
            <div className="settings-section-heading">
              <h3>Data</h3>
              <p>Export functionality will be connected later.</p>
            </div>

            <button
              type="button"
              className="settings-row settings-action"
              disabled
            >
              <Download size={19} />

              <div>
                <strong>Export activities</strong>
                <small>Coming soon</small>
              </div>
            </button>
          </section>

          <section className="settings-section settings-about">
            <Info size={19} />

            <div>
              <strong>FocusFlow</strong>
              <small>Version 1.0 · Local productivity tracker</small>
            </div>
          </section>
        </div>
      </aside>
    </>
  );
}

export default SettingsDrawer;
