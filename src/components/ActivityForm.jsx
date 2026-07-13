import { useContext, useState } from "react";
import "./ActivityForm.css";
import { ActivityContext } from "../context/ActivityContext";

function ActivityForm() {
  const { addActivity } = useContext(ActivityContext);

  function getToday() {
    const today = new Date();

    return (
      today.getFullYear() +
      "-" +
      String(today.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(today.getDate()).padStart(2, "0")
    );
  }

  function getCurrentTime() {
    const now = new Date();

    return (
      String(now.getHours()).padStart(2, "0") +
      ":" +
      String(now.getMinutes()).padStart(2, "0")
    );
  }

  const [activity, setActivity] = useState("");
  const [category, setCategory] = useState("Study");
  const [date, setDate] = useState(getToday());
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");

  function calculateDuration(start, end) {
    const startParts = start.split(":");
    const endParts = end.split(":");

    const startMinutes = Number(startParts[0]) * 60 + Number(startParts[1]);

    const endMinutes = Number(endParts[0]) * 60 + Number(endParts[1]);

    let totalMinutes;

    if (endMinutes >= startMinutes) {
      totalMinutes = endMinutes - startMinutes;
    } else {
      totalMinutes = 24 * 60 - startMinutes + endMinutes;
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return {
      duration: `${hours}h ${minutes}m`,
      durationMinutes: totalMinutes,
    };
  }

  function handleSubmit() {
    if (!activity.trim() || !date || !startTime || !endTime) {
      alert("Please fill all the required fields.");
      return;
    }

    const today = getToday();
    const currentTime = getCurrentTime();

    if (date > today) {
      alert("Future dates are not allowed.");
      return;
    }

    if (date === today && startTime > currentTime) {
      alert("The start time cannot be in the future.");
      return;
    }

    if (date === today && endTime > currentTime) {
      alert("The end time cannot be in the future.");
      return;
    }

    const durationData = calculateDuration(startTime, endTime);

    if (durationData.durationMinutes === 0) {
      alert("Start time and end time cannot be the same.");
      return;
    }

    const newActivity = {
      id: crypto.randomUUID(),
      activity: activity.trim(),
      category,
      date,
      startTime,
      endTime,
      duration: durationData.duration,
      durationMinutes: durationData.durationMinutes,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      entryType: "manual",
    };

    addActivity(newActivity);

    setActivity("");
    setCategory("Study");
    setDate(getToday());
    setStartTime("");
    setEndTime("");
    setNotes("");
  }

  return (
    <div className="activityForm">
      <h2>Add Activity</h2>

      <p className="subtitle">Add an activity you completed earlier.</p>

      <div className="form-group">
        <label htmlFor="activity-name">Activity</label>

        <input
          id="activity-name"
          type="text"
          placeholder="What did you do?"
          value={activity}
          onChange={(event) => setActivity(event.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="activity-category">Category</label>

        <select
          id="activity-category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          <option value="Study">Study</option>
          <option value="Fitness">Fitness</option>
          <option value="Break">Break</option>
          <option value="Work">Work</option>
          <option value="Personal">Personal</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="activity-date">Date</label>

        <input
          id="activity-date"
          type="date"
          value={date}
          max={getToday()}
          onChange={(event) => setDate(event.target.value)}
        />
      </div>

      <div className="time-row">
        <div className="form-group">
          <label htmlFor="start-time">Start Time</label>

          <input
            id="start-time"
            type="time"
            value={startTime}
            onChange={(event) => setStartTime(event.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="end-time">End Time</label>

          <input
            id="end-time"
            type="time"
            value={endTime}
            onChange={(event) => setEndTime(event.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="activity-notes">Notes</label>

        <textarea
          id="activity-notes"
          rows="4"
          placeholder="Anything you'd like to remember?"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        ></textarea>
      </div>

      <button type="button" onClick={handleSubmit}>
        Save Activity →
      </button>
    </div>
  );
}

export default ActivityForm;
