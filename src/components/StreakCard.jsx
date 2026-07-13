import { useContext, useMemo } from "react";
import { Flame, Trophy } from "lucide-react";
import { ActivityContext } from "../context/ActivityContext";
import "./StreakCard.css";

const focusCategories = ["Study", "Work", "Fitness"];

function getLocalDateKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function parseLocalDate(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Date(year, month - 1, day);
}

function getPreviousDateKey(dateKey) {
  const date = parseLocalDate(dateKey);
  date.setDate(date.getDate() - 1);

  return getLocalDateKey(date);
}

function StreakCard() {
  const { activities } = useContext(ActivityContext);

  const streakData = useMemo(() => {
    const activeDateKeys = new Set(
      activities
        .filter(
          (item) =>
            focusCategories.includes(item.category) &&
            Number(item.durationMinutes) > 0 &&
            typeof item.date === "string",
        )
        .map((item) => item.date),
    );

    if (activeDateKeys.size === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        focusedDays: 0,
      };
    }

    const sortedDates = [...activeDateKeys].sort();

    let longestStreak = 1;
    let runningStreak = 1;

    for (let index = 1; index < sortedDates.length; index += 1) {
      const expectedDate = getPreviousDateKey(sortedDates[index]);

      if (expectedDate === sortedDates[index - 1]) {
        runningStreak += 1;
        longestStreak = Math.max(longestStreak, runningStreak);
      } else {
        runningStreak = 1;
      }
    }

    const todayKey = getLocalDateKey(new Date());
    const yesterdayKey = getPreviousDateKey(todayKey);

    let currentDateKey = activeDateKeys.has(todayKey)
      ? todayKey
      : activeDateKeys.has(yesterdayKey)
        ? yesterdayKey
        : null;

    let currentStreak = 0;

    while (currentDateKey && activeDateKeys.has(currentDateKey)) {
      currentStreak += 1;
      currentDateKey = getPreviousDateKey(currentDateKey);
    }

    return {
      currentStreak,
      longestStreak,
      focusedDays: activeDateKeys.size,
    };
  }, [activities]);

  return (
    <section className="streak-section">
      <div className="streak-heading">
        <div>
          <p>Consistency</p>
          <h2>Focus Streaks</h2>
        </div>

        <span>Study · Work · Fitness</span>
      </div>

      <div className="streak-grid">
        <article className="streak-card">
          <div className="streak-icon current">
            <Flame size={22} />
          </div>

          <div>
            <p>Current Streak</p>

            <strong>
              {streakData.currentStreak}
              <span>{streakData.currentStreak === 1 ? " day" : " days"}</span>
            </strong>

            <small>
              {streakData.currentStreak > 0
                ? "Keep your momentum going"
                : "Complete a focus session today"}
            </small>
          </div>
        </article>

        <article className="streak-card">
          <div className="streak-icon longest">
            <Trophy size={22} />
          </div>

          <div>
            <p>Longest Streak</p>

            <strong>
              {streakData.longestStreak}
              <span>{streakData.longestStreak === 1 ? " day" : " days"}</span>
            </strong>

            <small>Your personal best</small>
          </div>
        </article>

        <article className="streak-card">
          <div className="streak-day-ring">{streakData.focusedDays}</div>

          <div>
            <p>Total Focus Days</p>

            <strong>
              {streakData.focusedDays}
              <span>{streakData.focusedDays === 1 ? " day" : " days"}</span>
            </strong>

            <small>Across all recorded activity</small>
          </div>
        </article>
      </div>
    </section>
  );
}

export default StreakCard;
