import { Settings } from "lucide-react";
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
      <LiveTimerButton
        activeSession={activeSession}
        onStartClick={onLiveSessionClick}
        onRunningClick={onRunningSessionClick}
      />

      <button
        type="button"
        className="global-action-button"
        onClick={onSettingsClick}
        aria-label="Open settings"
      >
        <Settings size={20} />
      </button>
    </div>
  );
}

export default GlobalActions;
