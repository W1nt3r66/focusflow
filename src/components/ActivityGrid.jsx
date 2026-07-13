import { useContext } from "react";
import { ActivityContext } from "../context/ActivityContext";
import ActivityTile from "./ActivityTile";
import "./ActivityGrid.css";

const categories = [
  {
    title: "Study",
    color: "#22a866",
  },
  {
    title: "Work",
    color: "#9956e8",
  },
  {
    title: "Fitness",
    color: "#f28b3c",
  },
  {
    title: "Personal",
    color: "#ef5b61",
  },
  {
    title: "Break",
    color: "#f5c242",
  },
];

function getLocalDateKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function formatMinutes(totalMinutes) {
  const safeMinutes = Number(totalMinutes) || 0;
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;

  return `${hours}h ${minutes}m`;
}

function ActivityGrid({ onCategoryClick }) {
  const { activities } = useContext(ActivityContext);

  const today = getLocalDateKey(new Date());

  function getCategoryTotal(category) {
    const totalMinutes = activities
      .filter((item) => item.date === today && item.category === category)
      .reduce((total, item) => total + Number(item.durationMinutes || 0), 0);

    return formatMinutes(totalMinutes);
  }

  return (
    <section className="activity-grid">
      {categories.map((category) => (
        <ActivityTile
          key={category.title}
          title={category.title}
          duration={getCategoryTotal(category.title)}
          color={category.color}
          onClick={() => onCategoryClick(category.title)}
        />
      ))}

      <ActivityTile
        title="More"
        duration="View All"
        color="#4f46e5"
        isMore
        onClick={() => onCategoryClick("All")}
      />
    </section>
  );
}

export default ActivityGrid;
