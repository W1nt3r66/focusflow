import { useContext, useEffect, useState } from "react";
import { Search, Trash2, X } from "lucide-react";
import { ActivityContext } from "../context/ActivityContext";
import "./ActivityModal.css";

function ActivityModal({ isOpen, onClose, title, activities }) {
  const { deleteActivity } = useContext(ActivityContext);

  const [searchQuery, setSearchQuery] = useState("");

  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;

      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredActivities = activities.filter((item) => {
    if (!normalizedQuery) {
      return true;
    }

    const searchableValues = [
      item.activity,
      item.category,
      item.date,
      item.startTime,
      item.endTime,
      item.duration,
      item.notes,
      item.entryType,
    ];

    return searchableValues.some((value) =>
      String(value || "")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  });

  function handleClose() {
    setSearchQuery("");
    setPendingDeleteId(null);
    onClose();
  }

  function requestDelete(activityId) {
    setPendingDeleteId(activityId);
  }

  function cancelDelete() {
    setPendingDeleteId(null);
  }

  function confirmDelete(activityId) {
    deleteActivity(activityId);
    setPendingDeleteId(null);
  }

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div className="modal-overlay" onClick={handleClose} aria-hidden="true" />

      <section
        className="activity-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="activity-modal-title"
      >
        <div className="modal-header">
          <div>
            <h2 id="activity-modal-title">{title}</h2>

            <p>
              {filteredActivities.length} of {activities.length} activities
            </p>
          </div>

          <button
            type="button"
            className="close-btn"
            onClick={handleClose}
            aria-label="Close activities"
          >
            <X size={20} />
          </button>
        </div>

        <div className="search-container">
          <Search className="search-icon" size={18} aria-hidden="true" />

          <input
            type="text"
            value={searchQuery}
            placeholder="Search activities..."
            className="search-input"
            onChange={(event) => setSearchQuery(event.target.value)}
            aria-label="Search activities"
          />

          {searchQuery && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
            >
              <X size={17} />
            </button>
          )}
        </div>

        <div className="modal-content">
          {filteredActivities.length === 0 ? (
            <div className="empty-text">
              <Search size={25} />

              <h3>
                {searchQuery ? "No matching activities" : "No activities yet"}
              </h3>

              <p>
                {searchQuery
                  ? "Try a different activity, category, or date."
                  : "Your saved activities will appear here."}
              </p>
            </div>
          ) : (
            filteredActivities.map((item, index) => {
              const activityKey =
                item.id ||
                item.createdAt ||
                `${item.activity}-${item.date}-${index}`;

              const isConfirmingDelete = pendingDeleteId === item.id;

              return (
                <article className="activity-row" key={activityKey}>
                  <div className="activity-info">
                    <div className="activity-row-heading">
                      <span className="activity-category">{item.category}</span>

                      <span className="activity-entry-type">
                        {item.entryType === "live" ? "Live" : "Manual"}
                      </span>
                    </div>

                    <h3>{item.activity}</h3>

                    <p className="activity-date">{item.date}</p>

                    <span className="activity-time">
                      {item.startTime} → {item.endTime}
                    </span>

                    {item.notes && (
                      <p className="activity-notes">{item.notes}</p>
                    )}
                  </div>

                  <div className="activity-row-actions">
                    <strong>{item.duration}</strong>

                    {isConfirmingDelete ? (
                      <div className="delete-confirmation">
                        <span>Delete?</span>

                        <button
                          type="button"
                          className="cancel-delete-btn"
                          onClick={cancelDelete}
                        >
                          Cancel
                        </button>

                        <button
                          type="button"
                          className="confirm-delete-btn"
                          onClick={() => confirmDelete(item.id)}
                        >
                          Delete
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="delete-activity-btn"
                        onClick={() => requestDelete(item.id)}
                        aria-label={`Delete ${item.activity}`}
                      >
                        <Trash2 size={17} />
                      </button>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
    </>
  );
}

export default ActivityModal;
