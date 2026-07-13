import { Clock3, Play, Radio } from "lucide-react";
import "./LiveSessionCard.css";

function LiveSessionCard({ activeSession, onStart, onViewSession }) {
  const isRunning = Boolean(activeSession);

  return (
    <section className={`live-session-card ${isRunning ? "is-running" : ""}`}>
      <div className="live-session-heading">
        <div className="live-session-icon">
          {isRunning ? <Radio size={22} /> : <Clock3 size={22} />}
        </div>

        <div>
          <p className="live-session-label">
            {isRunning ? "Session in progress" : "Live focus session"}
          </p>

          <h2>{isRunning ? activeSession.activity : "Ready to Focus?"}</h2>
        </div>
      </div>

      <p className="live-session-description">
        {isRunning
          ? `${activeSession.category} · FocusFlow is tracking your focused time.`
          : "Start a focused session and let FocusFlow track your time."}
      </p>

      <button
        type="button"
        className="start-session-btn"
        onClick={isRunning ? onViewSession : onStart}
      >
        {isRunning ? <Clock3 size={19} /> : <Play size={19} />}

        {isRunning ? "View Current Session" : "Start Focus Session"}
      </button>
    </section>
  );
}

export default LiveSessionCard;
