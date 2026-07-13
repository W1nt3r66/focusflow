import WeeklyPieChart from "./WeeklyPieChart";
import "./FocusCard.css";

function FocusCard() {
  const activities = [];

  return (
    <div className="focus-card">
      <div className="focus-header">
        <div>
          <h2>Today's Focus</h2>
          <h1>0h 0m</h1>
          <p>Updated Live</p>
        </div>
      </div>

      <div className="chart-area">
        <WeeklyPieChart activities={activities} />
      </div>
    </div>
  );
}

export default FocusCard;
