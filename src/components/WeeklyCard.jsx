import WeeklyPieChart from "./WeeklyPieChart";
import { useContext } from "react";
import { ActivityContext } from "../context/ActivityContext";

import "./WeeklyCard.css";

function WeeklyCard() {
  const { activities } = useContext(ActivityContext);

  return (
    <div className="weekly-card">
      <h2>Weekly Distribution</h2>

      <WeeklyPieChart activities={activities} />
    </div>
  );
}

export default WeeklyCard;
