import WeeklyPieChart from "./WeeklyPieChart";
import "./DashboardCard.css";

function DashboardCard({ todayFocus, activities }) {
  // Example goal (6 hours)
  const goalMinutes = 360;

  const todayMinutes = activities
    .filter(
      (item) =>
        item.category === "Study" ||
        item.category === "Work" ||
        item.category === "Fitness",
    )
    .reduce((sum, item) => sum + item.durationMinutes, 0);

  const progress = Math.min((todayMinutes / goalMinutes) * 100, 100);

  return (
    <div className="dashboard-card">
      <div className="focus-header">
        <h2>Today's Focus</h2>

        <h1>{todayFocus}</h1>

        <p>Keep going. You're doing great.</p>
      </div>

      <div className="goal-section">
        <div className="goal-label">
          <span>Today's Goal</span>
          <span>
            {todayMinutes} / {goalMinutes} mins
          </span>
        </div>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="chart-section">
        <h3>Weekly Distribution</h3>

        <WeeklyPieChart activities={activities} />
      </div>
    </div>
  );
}

export default DashboardCard;
