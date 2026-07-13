import { useEffect, useState } from "react";
import { getFocusSeconds } from "../context/ActivityContext";

function LiveTimerButton({ activeSession, onStartClick, onRunningClick }) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!activeSession) {
      return;
    }

    function updateElapsedTime() {
      setElapsedSeconds(getFocusSeconds(activeSession));
    }

    const initialUpdate = setTimeout(updateElapsedTime, 0);

    const interval = setInterval(updateElapsedTime, 1000);

    return () => {
      clearTimeout(initialUpdate);
      clearInterval(interval);
    };
  }, [activeSession]);

  if (!activeSession) {
    return (
      <button
        type="button"
        className="global-action-button live-action-button"
        onClick={onStartClick}
        aria-label="Start a live focus session"
      >
        ▶
      </button>
    );
  }

  const hours = Math.floor(elapsedSeconds / 3600);

  const minutes = Math.floor((elapsedSeconds % 3600) / 60);

  const display = [hours, minutes]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");

  return (
    <button
      type="button"
      className={`global-action-button live-action-button running ${
        activeSession.breakStartedAt ? "on-break" : ""
      }`}
      onClick={onRunningClick}
      aria-label={
        activeSession.breakStartedAt
          ? "View current break"
          : `View running session, elapsed time ${display}`
      }
    >
      {activeSession.breakStartedAt ? "BREAK" : display}
    </button>
  );
}

export default LiveTimerButton;
