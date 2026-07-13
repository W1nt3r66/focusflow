import { useContext, useEffect, useState } from "react";
import {
  ActivityContext,
  getFocusMilliseconds,
} from "../context/ActivityContext";
import { GoalsContext } from "../context/GoalsContext";
import { SettingsContext } from "../context/SettingsContext";
import "./GreetingCard.css";

const focusCategories = ["Study", "Work", "Fitness"];

const goalColors = {
  Study: "#22a866",
  Work: "#9956e8",
  Fitness: "#f28b3c",
};

function getDateKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function formatMinutes(totalMinutes) {
  const minutes = Number(totalMinutes) || 0;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${hours}h ${remainingMinutes}m`;
}

function getIncludedDayCount(startDate, endDate, excludedWeekdays = []) {
  const excludedDays = new Set(excludedWeekdays.map(Number));
  const currentDate = new Date(`${startDate}T00:00:00Z`);
  const finalDate = new Date(`${endDate}T00:00:00Z`);

  let includedDays = 0;

  while (currentDate <= finalDate) {
    if (!excludedDays.has(currentDate.getUTCDay())) {
      includedDays += 1;
    }

    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  return Math.max(1, includedDays);
}

function GoalRows({ goals, mode }) {
  return (
    <div className="hero-goals">
      {goals.map((goal) => {
        const isDaily = mode === "daily";

        const percentage = isDaily
          ? goal.dailyPercentage
          : goal.periodPercentage;

        const currentMinutes = isDaily ? goal.todayMinutes : goal.periodMinutes;

        const targetMinutes = isDaily
          ? goal.dailyTargetMinutes
          : goal.targetMinutes;

        const showRestDay = isDaily && goal.isRestDay;

        return (
          <div className="hero-goal-row" key={`${goal.id}-${mode}`}>
            <div className="hero-goal-heading">
              <span>
                <i
                  className="hero-goal-dot"
                  style={{
                    backgroundColor: goalColors[goal.category],
                  }}
                />

                {goal.category}
              </span>

              <strong>{showRestDay ? "Rest" : `${percentage}%`}</strong>
            </div>

            {showRestDay ? (
              <div className="hero-goal-rest-track" />
            ) : (
              <div className="hero-goal-track">
                <div
                  className="hero-goal-value"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: goalColors[goal.category],
                  }}
                />
              </div>
            )}

            <p>
              {showRestDay ? (
                "Excluded from today’s target"
              ) : (
                <>
                  {formatMinutes(currentMinutes)} of{" "}
                  {formatMinutes(targetMinutes)}
                  {!isDaily && (
                    <> · {goal.period === "weekly" ? "Weekly" : "Monthly"}</>
                  )}
                </>
              )}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function GreetingCard() {
  const { activities, activeSession } = useContext(ActivityContext);
  const { activeGoals } = useContext(GoalsContext);
  const { displayName } = useContext(SettingsContext);

  const [liveMinutes, setLiveMinutes] = useState(0);

  useEffect(() => {
    if (!activeSession) {
      return;
    }

    function updateLiveMinutes() {
      const focusedMilliseconds = getFocusMilliseconds(activeSession);

      setLiveMinutes(Math.max(0, Math.floor(focusedMilliseconds / 60000)));
    }

    const initialUpdate = setTimeout(updateLiveMinutes, 0);
    const interval = setInterval(updateLiveMinutes, 10000);

    return () => {
      clearTimeout(initialUpdate);
      clearInterval(interval);
    };
  }, [activeSession]);

  const now = new Date();
  const today = getDateKey(now);
  const currentHour = now.getHours();

  let greeting = "Good Evening";
  let message = "Finish your day strong.";

  if (currentHour < 12) {
    greeting = "Good Morning";
    message = "Start your day with purpose.";
  } else if (currentHour < 17) {
    greeting = "Good Afternoon";
    message = "Keep the momentum going.";
  }

  const displayDate = now.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const completedTodayMinutes = activities
    .filter(
      (item) => item.date === today && focusCategories.includes(item.category),
    )
    .reduce((total, item) => total + Number(item.durationMinutes || 0), 0);

  const runningTodayMinutes =
    activeSession && focusCategories.includes(activeSession.category)
      ? liveMinutes
      : 0;

  const todayFocusMinutes = completedTodayMinutes + runningTodayMinutes;

  const focusHours = Math.floor(todayFocusMinutes / 60);
  const focusMinutes = todayFocusMinutes % 60;

  const goalProgress = activeGoals.map((goal) => {
    const excludedWeekdays = Array.isArray(goal.excludedWeekdays)
      ? goal.excludedWeekdays.map(Number)
      : [];

    const completedPeriodMinutes = activities
      .filter(
        (item) =>
          item.category === goal.category &&
          item.date >= goal.startDate &&
          item.date <= goal.endDate,
      )
      .reduce((total, item) => total + Number(item.durationMinutes || 0), 0);

    const completedCategoryTodayMinutes = activities
      .filter((item) => item.category === goal.category && item.date === today)
      .reduce((total, item) => total + Number(item.durationMinutes || 0), 0);

    const includesRunningSession =
      activeSession &&
      activeSession.category === goal.category &&
      today >= goal.startDate &&
      today <= goal.endDate;

    const runningGoalMinutes = includesRunningSession ? liveMinutes : 0;

    const periodMinutes = completedPeriodMinutes + runningGoalMinutes;

    const todayMinutes = completedCategoryTodayMinutes + runningGoalMinutes;

    const targetMinutes = Number(goal.targetMinutes) || 0;

    const includedDayCount = getIncludedDayCount(
      goal.startDate,
      goal.endDate,
      excludedWeekdays,
    );

    const dailyTargetMinutes = Math.ceil(targetMinutes / includedDayCount);

    const isRestDay = excludedWeekdays.includes(now.getDay());

    const periodPercentage =
      targetMinutes > 0
        ? Math.min(Math.round((periodMinutes / targetMinutes) * 100), 100)
        : 0;

    const dailyPercentage =
      !isRestDay && dailyTargetMinutes > 0
        ? Math.min(Math.round((todayMinutes / dailyTargetMinutes) * 100), 100)
        : 0;

    return {
      ...goal,
      periodMinutes,
      todayMinutes,
      targetMinutes,
      dailyTargetMinutes,
      periodPercentage,
      dailyPercentage,
      isRestDay,
    };
  });

  const safeDisplayName =
    typeof displayName === "string" ? displayName.trim() : "";

  let focusStatus = "Updated Live";

  if (activeSession?.breakStartedAt) {
    focusStatus = "Break in progress · Focus paused";
  } else if (
    activeSession &&
    focusCategories.includes(activeSession.category)
  ) {
    focusStatus = "Session running · Updated live";
  }

  return (
    <section className="hero-card">
      <div className="hero-copy">
        <p className="hero-date">{displayDate}</p>

        <h1 className="hero-title">
          {greeting},<span>{safeDisplayName || "Sounava"}</span>
        </h1>

        <p className="hero-message">{message}</p>
      </div>

      <div className="hero-focus">
        <p className="focus-label">Today&apos;s Focus</p>

        <div className="focus-time">
          <span className="focus-hours">{focusHours}h</span>

          <span className="focus-minutes">
            {String(focusMinutes).padStart(2, "0")}m
          </span>
        </div>

        {goalProgress.length > 0 ? (
          <div className="hero-goal-sections">
            <section className="hero-goal-section">
              <p className="hero-goal-section-title">Daily goals</p>

              <GoalRows goals={goalProgress} mode="daily" />
            </section>

            <section className="hero-goal-section">
              <p className="hero-goal-section-title">Weekly / monthly goals</p>

              <GoalRows goals={goalProgress} mode="period" />
            </section>
          </div>
        ) : (
          <p className="hero-no-goals">No active goals</p>
        )}

        <p className="focus-status">{focusStatus}</p>
      </div>
    </section>
  );
}

export default GreetingCard;
