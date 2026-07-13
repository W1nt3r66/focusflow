import { Coffee, Forward } from "lucide-react";
import "./BreakReminderPopup.css";

function BreakReminderPopup({ isOpen, activity, onStartBreak, onSkip }) {
  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div className="break-reminder-overlay" aria-hidden="true" />

      <section
        className="break-reminder-popup"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="break-reminder-title"
        aria-describedby="break-reminder-description"
      >
        <div className="break-reminder-icon">
          <Coffee size={26} />
        </div>

        <p className="break-reminder-eyebrow">Focus reminder</p>

        <h2 id="break-reminder-title">Time for a break</h2>

        <p id="break-reminder-description">
          You have focused on <strong>{activity}</strong> for 50 minutes. Step
          away briefly and return refreshed.
        </p>

        <div className="break-reminder-options">
          <button
            type="button"
            className="break-reminder-primary"
            onClick={() => onStartBreak(5)}
          >
            <Coffee size={18} />
            Take 5 min
          </button>

          <button
            type="button"
            className="break-reminder-primary"
            onClick={() => onStartBreak(10)}
          >
            <Coffee size={18} />
            Take 10 min
          </button>
        </div>

        <button type="button" className="break-reminder-skip" onClick={onSkip}>
          <Forward size={16} />
          Skip for now
        </button>
      </section>
    </>
  );
}

export default BreakReminderPopup;
