import "./ActivityTable.css";

function ActivityTable({ activities }) {
  if (!activities.length) {
    return (
      <section className="activity-table-card">
        <div className="activity-table-heading">
          <h2>Activity History</h2>
          <p>No activities recorded yet.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="activity-table-card">
      <div className="activity-table-heading">
        <h2>Activity History</h2>

        <p>
          {activities.length}{" "}
          {activities.length === 1 ? "activity" : "activities"}
        </p>
      </div>

      <div className="activity-table-scroll">
        <table className="activity-table">
          <thead>
            <tr>
              <th>Activity</th>
              <th>Category</th>
              <th>Date</th>
              <th>Start</th>
              <th>End</th>
              <th>Duration</th>
            </tr>
          </thead>

          <tbody>
            {activities.map((item, index) => (
              <tr
                key={item.id || item.createdAt || `${item.activity}-${index}`}
              >
                <td>
                  <strong>{item.activity}</strong>
                </td>

                <td>
                  <span className="table-category">{item.category}</span>
                </td>

                <td>{item.date}</td>
                <td>{item.startTime}</td>
                <td>{item.endTime}</td>

                <td>
                  <strong>{item.duration}</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default ActivityTable;
