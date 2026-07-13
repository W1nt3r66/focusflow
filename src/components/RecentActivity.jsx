import { useContext } from "react";
import { ActivityContext } from "../context/ActivityContext";
import "./RecentActivity.css";

function RecentActivity() {
  const { activities } = useContext(ActivityContext);

  const recentActivities = [...activities]
    .sort((a, b) => {
      const first = new Date(`${a.date}T${a.startTime}`);
      const second = new Date(`${b.date}T${b.startTime}`);

      return second - first;
    })
    .slice(0, 5);

  return (
    <section className="recent-activity">
      <div className="recent-header">
        <div>
          <p className="recent-label">Latest entries</p>
          <h2>Recent Activity</h2>
        </div>

        <span>{recentActivities.length}/5</span>
      </div>

      {recentActivities.length === 0 ? (
        <div className="recent-empty">
          <h3>No activities yet</h3>
          <p>Your latest five activities will appear here.</p>
        </div>
      ) : (
        <div className="recent-list">
          {recentActivities.map((item, index) => (
            <div
              className="recent-item"
              key={`${item.activity}-${item.date}-${item.startTime}-${index}`}
            >
              <div className="recent-main">
                <span className="category-chip">{item.category}</span>

                <h3>{item.activity}</h3>

                <p>
                  {item.date} · {item.startTime} → {item.endTime}
                </p>
              </div>

              <strong>{item.duration}</strong>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default RecentActivity;
