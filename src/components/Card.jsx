import "./Card.css";
import { ChevronRight } from "lucide-react";

function Card({ title, value, color, onClick }) {
  return (
    <div className={`card ${onClick ? "clickable" : ""}`} onClick={onClick}>
      <div
        className="card-dot"
        style={{
          background: color,
        }}
      />

      <h3>{title}</h3>

      <h2>{value}</h2>

      <div className="card-footer">
        {title === "More" ? (
          <span>View All Activities</span>
        ) : (
          <ChevronRight size={18} />
        )}
      </div>
    </div>
  );
}

export default Card;
