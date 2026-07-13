import { ChevronRight } from "lucide-react";
import "./ActivityTile.css";

function ActivityTile({ title, duration, color, isMore = false, onClick }) {
  return (
    <button
      type="button"
      className="activity-tile"
      onClick={onClick}
      aria-label={isMore ? "View all activities" : `View ${title} activities`}
    >
      <span
        className="tile-color-dot"
        style={{
          backgroundColor: color,
        }}
        aria-hidden="true"
      />

      <span className="tile-title">{title}</span>

      <strong className={`tile-duration ${isMore ? "tile-view-all" : ""}`}>
        {duration}
      </strong>

      <span className="tile-footer">
        <span>{isMore ? "View All Activities" : "View Details"}</span>

        <ChevronRight size={18} aria-hidden="true" />
      </span>
    </button>
  );
}

export default ActivityTile;
