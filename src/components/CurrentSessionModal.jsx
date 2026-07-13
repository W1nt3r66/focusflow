import { useEffect, useState } from "react";
import { Coffee, Pause, Play, Square, X } from "lucide-react";
import { getFocusSeconds } from "../context/ActivityContext";
import "./CurrentSessionModal.css";

function formatTimer(totalSeconds) {
  const safeSeconds = Math.max(0, totalSeconds);

  const hours = Math.floor(safeSeconds / 3600);

  const minutes = Math.floor((safeSeconds % 3600) / 60);

  const seconds = safeSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

function CurrentSessionModal({
  isOpen,
  onClose,
  activeSession,
  onStop,
  onStartBreak,
  onResume,
}) {
  const [timing, setTiming] = useState({
    focusSeconds: 0,
    breakRemainingSeconds: 0,
  });

  useEffect(() => {
    if (!activeSession) {
      return;
    }

    function updateTiming() {
      const now = Date.now();

      const focusSeconds = getFocusSeconds(activeSession, now);

      let breakRemainingSeconds = 0;

      if (activeSession.breakStartedAt && activeSession.breakEndsAt) {
        const breakEndsAt = new Date(activeSession.breakEndsAt).getTime();

        if (!Number.isNaN(breakEndsAt)) {
          breakRemainingSeconds = Math.max(
            0,
            Math.ceil((breakEndsAt - now) / 1000),
          );
        }
      }

      setTiming({
        focusSeconds,
        breakRemainingSeconds,
      });
    }

    const initialUpdate = setTimeout(updateTiming, 0);

    const interval = setInterval(updateTiming, 1000);

    return () => {
      clearTimeout(initialUpdate);
      clearInterval(interval);
    };
  }, [activeSession]);

  if (!isOpen || !activeSession) {
    return null;
  }

  const isOnBreak = Boolean(activeSession.breakStartedAt);

  const isBreakComplete = isOnBreak && timing.breakRemainingSeconds === 0;

  return (
    <>
      <div className="session-overlay" onClick={onClose} aria-hidden="true" />

      <section
        className="session-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="current-session-title"
      >
        <button
          type="button"
          className="session-close-btn"
          onClick={onClose}
          aria-label="Close current session"
        >
          <X size={19} />
        </button>

        {isOnBreak ? (
          <>
            <div className="session-state-icon">
              <Coffee size={24} />
            </div>

            <p className="session-eyebrow">
              {isBreakComplete ? "Break complete" : "Break in progress"}
            </p>

            <h2 id="current-session-title">
              {isBreakComplete
                ? "Ready to continue?"
                : "Take a moment to reset"}
            </h2>

            <div className="session-time break-time">
              {formatTimer(timing.breakRemainingSeconds)}
            </div>

            <p className="session-description">
              Focus tracking is paused. Break time will not be added to your
              activity.
            </p>

            <button
              type="button"
              className="resume-session-btn"
              onClick={onResume}
            >
              <Play size={18} />

              {isBreakComplete ? "Continue Focus" : "End Break Early"}
            </button>
          </>
        ) : (
          <>
            <div className="session-state-icon">
              <Pause size={24} />
            </div>

            <p className="session-eyebrow">Current Focus Session</p>

            <h2 id="current-session-title">{activeSession.activity}</h2>

            <span className="session-category">{activeSession.category}</span>

            <div className="session-time">
              {formatTimer(timing.focusSeconds)}
            </div>

            <div className="break-options">
              <button
                type="button"
                className="break-chip"
                onClick={() => onStartBreak(5)}
              >
                <Coffee size={16} />5 min Break
              </button>

              <button
                type="button"
                className="break-chip"
                onClick={() => onStartBreak(10)}
              >
                <Coffee size={16} />
                10 min Break
              </button>
            </div>

            <button type="button" className="stop-session-btn" onClick={onStop}>
              <Square size={17} />
              Stop Session
            </button>
          </>
        )}
      </section>
    </>
  );
}

export default CurrentSessionModal;
