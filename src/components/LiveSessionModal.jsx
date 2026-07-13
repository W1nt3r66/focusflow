import { Play, X } from "lucide-react";
import "./LiveSessionModal.css";

function LiveSessionModal({
  isOpen,
  onClose,
  activity,
  setActivity,
  category,
  setCategory,
  onStart,
}) {
  if (!isOpen) {
    return null;
  }

  function handleStart() {
    if (!activity.trim()) {
      alert("Please enter an activity name.");
      return;
    }

    onStart();
  }

  return (
    <>
      <div className="live-modal-overlay" onClick={onClose}></div>

      <div className="live-session-modal">
        <div className="live-modal-header">
          <div>
            <p>Live timer</p>
            <h2>Start Focus Session</h2>
          </div>

          <button
            type="button"
            className="live-modal-close"
            onClick={onClose}
            aria-label="Close live-session window"
          >
            <X size={20} />
          </button>
        </div>

        <div className="live-modal-content">
          <div className="form-group">
            <label htmlFor="live-activity">Activity</label>

            <input
              id="live-activity"
              type="text"
              value={activity}
              placeholder="What are you working on?"
              autoFocus
              onChange={(event) => setActivity(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="live-category">Category</label>

            <select
              id="live-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="Study">Study</option>
              <option value="Work">Work</option>
              <option value="Fitness">Fitness</option>
              <option value="Personal">Personal</option>
              <option value="Break">Break</option>
            </select>
          </div>

          <button
            type="button"
            className="live-start-button"
            onClick={handleStart}
          >
            <Play size={18} />
            Start Session
          </button>
        </div>
      </div>
    </>
  );
}

export default LiveSessionModal;
