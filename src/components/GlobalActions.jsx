import { Bell, Settings } from "lucide-react";
import LiveTimerButton from "./LiveTimerButton";

import "./GlobalActions.css";

function GlobalActions({
  activeSession,
  onLiveSessionClick,
  onRunningSessionClick,
  onSettingsClick,
}) {
  return (
    <div className="global-actions">
      <button className="global-action-button" aria-label="Notifications">
        <Bell size={20} />
      </button>

      <LiveTimerButton
        activeSession={activeSession}
        onStartClick={onLiveSessionClick}
        onRunningClick={onRunningSessionClick}
      />

      <button className="global-action-button" onClick={onSettingsClick}>
        <Settings size={20} />
      </button>
    </div>
  );
}

export default GlobalActions;
