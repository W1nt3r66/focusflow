import { createContext, useEffect, useState } from "react";

const allowedCategories = ["Study", "Work", "Fitness"];

function getDateKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function getPeriodDates(period) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  let start;
  let end;

  if (period === "monthly") {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  } else {
    const day = now.getDay();
    const daysFromMonday = day === 0 ? 6 : day - 1;

    start = new Date(now);
    start.setDate(start.getDate() - daysFromMonday);

    end = new Date(start);
    end.setDate(end.getDate() + 6);
  }

  return {
    startDate: getDateKey(start),
    endDate: getDateKey(end),
  };
}

// Context and provider intentionally share this file.
// eslint-disable-next-line react-refresh/only-export-components
export const GoalsContext = createContext({
  goals: {},
  activeGoals: [],
  setGoal: () => false,
});

// eslint-disable-next-line react-refresh/only-export-components
export function isGoalActive(goal, today = getDateKey(new Date())) {
  return Boolean(goal && goal.startDate <= today && goal.endDate >= today);
}

export function GoalsProvider({ children }) {
  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem("focusflow-goals");

    try {
      const parsed = saved ? JSON.parse(saved) : {};

      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? parsed
        : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem("focusflow-goals", JSON.stringify(goals));
  }, [goals]);

  const activeGoals = Object.values(goals).filter((goal) => isGoalActive(goal));

  function setGoal(category, period, targetHours, excludedWeekdays = []) {
    if (
      !allowedCategories.includes(category) ||
      !["weekly", "monthly"].includes(period)
    ) {
      return false;
    }

    const hours = Number(targetHours);

    if (!Number.isFinite(hours) || hours <= 0) {
      return false;
    }

    if (isGoalActive(goals[category])) {
      return false;
    }

    const safeExcludedWeekdays = Array.isArray(excludedWeekdays)
      ? [...new Set(excludedWeekdays.map(Number))].filter((day) =>
          [0, 6].includes(day),
        )
      : [];

    const { startDate, endDate } = getPeriodDates(period);

    const newGoal = {
      id: crypto.randomUUID(),
      category,
      period,
      targetMinutes: Math.round(hours * 60),
      excludedWeekdays: safeExcludedWeekdays,
      startDate,
      endDate,
      createdAt: new Date().toISOString(),
    };

    setGoals((previous) => ({
      ...previous,
      [category]: newGoal,
    }));

    return true;
  }

  return (
    <GoalsContext.Provider
      value={{
        goals,
        activeGoals,
        setGoal,
      }}
    >
      {children}
    </GoalsContext.Provider>
  );
}
