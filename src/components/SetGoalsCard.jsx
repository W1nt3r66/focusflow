import { useContext, useState } from "react";
import { CheckCircle2, Lock, Target } from "lucide-react";
import { ActivityContext } from "../context/ActivityContext";
import { GoalsContext, isGoalActive } from "../context/GoalsContext";
import "./SetGoalsCard.css";

const categories = ["Study", "Work", "Fitness"];

function formatMinutes(totalMinutes) {
  const minutes = Number(totalMinutes) || 0;

  const hours = Math.floor(minutes / 60);

  const remainingMinutes = minutes % 60;

  return `${hours}h ${remainingMinutes}m`;
}

function SetGoalsCard() {
  const { activities } = useContext(ActivityContext);

  const { goals, setGoal } = useContext(GoalsContext);

  const [category, setCategory] = useState("Study");

  const [period, setPeriod] = useState("weekly");

  const [targetHours, setTargetHours] = useState("");

  const [message, setMessage] = useState("");

  const [pendingGoal, setPendingGoal] = useState(null);

  const activeCategories = categories.filter((item) =>
    isGoalActive(goals[item]),
  );

  const availableCategories = categories.filter(
    (item) => !activeCategories.includes(item),
  );

  const selectedCategory = availableCategories.includes(category)
    ? category
    : availableCategories[0] || "";

  function getGoalProgress(goal) {
    return activities
      .filter(
        (item) =>
          item.category === goal.category &&
          item.date >= goal.startDate &&
          item.date <= goal.endDate,
      )
      .reduce((total, item) => total + Number(item.durationMinutes || 0), 0);
  }

  function handleSubmit(event) {
    event.preventDefault();

    const hours = Number(targetHours);

    if (!selectedCategory || !Number.isFinite(hours) || hours <= 0) {
      setMessage("Enter a valid target greater than zero.");

      return;
    }

    setMessage("");

    setPendingGoal({
      category: selectedCategory,
      period,
      targetHours: hours,
    });
  }

  function cancelGoalConfirmation() {
    setPendingGoal(null);
  }

  function confirmGoal() {
    if (!pendingGoal) {
      return;
    }

    const created = setGoal(
      pendingGoal.category,
      pendingGoal.period,
      pendingGoal.targetHours,
    );

    if (!created) {
      setMessage("This goal could not be created.");

      setPendingGoal(null);
      return;
    }

    setTargetHours("");
    setMessage("Goal locked successfully.");

    const nextCategory = availableCategories.find(
      (item) => item !== pendingGoal.category,
    );

    if (nextCategory) {
      setCategory(nextCategory);
    }

    setPendingGoal(null);
  }

  return (
    <section className="set-goals-card">
      <div className="set-goals-header">
        <div className="set-goals-icon">
          <Target size={22} />
        </div>

        <div>
          <p>Focus planning</p>
          <h2>Set Goals</h2>
        </div>
      </div>

      <p className="set-goals-description">
        Set separate Study, Work, and Fitness targets. A goal remains locked
        until its current week or month ends.
      </p>

      {activeCategories.length > 0 && (
        <div className="active-goals-list">
          {activeCategories.map((goalCategory) => {
            const goal = goals[goalCategory];

            const completedMinutes = getGoalProgress(goal);

            const percentage = Math.min(
              Math.round((completedMinutes / goal.targetMinutes) * 100),
              100,
            );

            return (
              <article className="active-goal-row" key={goal.id}>
                <div className="active-goal-main">
                  <span className="active-goal-category">{goal.category}</span>

                  <strong>
                    {formatMinutes(completedMinutes)} /{" "}
                    {formatMinutes(goal.targetMinutes)}
                  </strong>
                </div>

                <div className="goal-progress-track">
                  <div
                    className="goal-progress-value"
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>

                <div className="active-goal-footer">
                  <span>
                    {goal.period === "weekly" ? "Weekly" : "Monthly"} goal
                  </span>

                  <span>
                    <Lock size={12} />
                    Locked until {goal.endDate}
                  </span>

                  <strong>{percentage}%</strong>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {availableCategories.length > 0 ? (
        <form className="set-goal-form" onSubmit={handleSubmit}>
          <div className="set-goal-fields">
            <label>
              Category
              <select
                value={selectedCategory}
                onChange={(event) => {
                  setCategory(event.target.value);

                  setMessage("");
                }}
              >
                {availableCategories.map((item) => (
                  <option value={item} key={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Period
              <select
                value={period}
                onChange={(event) => {
                  setPeriod(event.target.value);

                  setMessage("");
                }}
              >
                <option value="weekly">Weekly</option>

                <option value="monthly">Monthly</option>
              </select>
            </label>

            <label>
              Target hours
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={targetHours}
                placeholder="10"
                onChange={(event) => {
                  setTargetHours(event.target.value);

                  setMessage("");
                }}
              />
            </label>
          </div>

          {message && <p className="set-goal-message">{message}</p>}

          <button type="submit" className="lock-goal-btn">
            <Lock size={17} />
            Set and Lock Goal
          </button>
        </form>
      ) : (
        <div className="all-goals-set">
          <CheckCircle2 size={20} />

          <span>All three category goals are active.</span>
        </div>
      )}

      {pendingGoal && (
        <>
          <div className="goal-confirm-overlay" aria-hidden="true" />

          <div
            className="goal-confirm-popup"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="goal-confirm-title"
          >
            <div className="goal-confirm-icon">
              <Lock size={22} />
            </div>

            <p className="goal-confirm-eyebrow">Confirm goal</p>

            <h3 id="goal-confirm-title">Are you sure?</h3>

            <p>
              You are setting a <strong>{pendingGoal.targetHours}-hour</strong>{" "}
              {pendingGoal.period === "weekly" ? "weekly" : "monthly"} goal for{" "}
              <strong>{pendingGoal.category}</strong>.
            </p>

            <p className="goal-lock-warning">
              Once confirmed, this goal cannot be changed until the current{" "}
              {pendingGoal.period === "weekly" ? "week" : "month"} ends.
            </p>

            <div className="goal-confirm-actions">
              <button
                type="button"
                className="goal-confirm-cancel"
                onClick={cancelGoalConfirmation}
              >
                Go Back
              </button>

              <button
                type="button"
                className="goal-confirm-submit"
                onClick={confirmGoal}
              >
                <Lock size={16} />
                Confirm and Lock
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default SetGoalsCard;
