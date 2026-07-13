import { createContext, useEffect, useState } from "react";

const BREAK_REMINDER_INTERVAL_MS = 50 * 60 * 1000;

// Context and provider intentionally share this file.
// eslint-disable-next-line react-refresh/only-export-components
export const ActivityContext = createContext({
  activities: [],
  activeSession: null,
  addActivity: () => {},
  deleteActivity: () => {},
  startSession: () => {},
  stopSession: () => {},
  startBreak: () => {},
  resumeSession: () => {},
  skipBreakReminder: () => {},
});

// eslint-disable-next-line react-refresh/only-export-components
export function getFocusMilliseconds(session, currentTime = Date.now()) {
  if (!session?.startedAt) {
    return 0;
  }

  const startedAt = new Date(session.startedAt).getTime();

  if (Number.isNaN(startedAt)) {
    return 0;
  }

  const completedBreakMilliseconds =
    Number(session.totalBreakMilliseconds) || 0;

  let currentBreakMilliseconds = 0;

  if (session.breakStartedAt) {
    const breakStartedAt = new Date(session.breakStartedAt).getTime();

    if (!Number.isNaN(breakStartedAt)) {
      currentBreakMilliseconds = Math.max(0, currentTime - breakStartedAt);
    }
  }

  return Math.max(
    0,
    currentTime -
      startedAt -
      completedBreakMilliseconds -
      currentBreakMilliseconds,
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function getFocusSeconds(session, currentTime = Date.now()) {
  return Math.floor(getFocusMilliseconds(session, currentTime) / 1000);
}

export function ActivityProvider({ children }) {
  const [activities, setActivities] = useState(() => {
    const saved = localStorage.getItem("focusflow-activities");

    try {
      const parsed = saved ? JSON.parse(saved) : [];

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.map((activity) => ({
        ...activity,
        id: activity.id || crypto.randomUUID(),
      }));
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("focusflow-activities", JSON.stringify(activities));
  }, [activities]);

  function addActivity(activity) {
    setActivities((previous) => [...previous, activity]);
  }

  function deleteActivity(activityId) {
    setActivities((previous) =>
      previous.filter((activity) => activity.id !== activityId),
    );
  }

  const [activeSession, setActiveSession] = useState(() => {
    const saved = localStorage.getItem("focusflow-active-session");

    try {
      const session = saved ? JSON.parse(saved) : null;

      if (
        !session ||
        typeof session !== "object" ||
        Number.isNaN(Date.parse(session.startedAt))
      ) {
        return null;
      }

      return {
        ...session,

        totalBreakMilliseconds: Number(session.totalBreakMilliseconds) || 0,

        breakStartedAt: session.breakStartedAt || null,

        breakEndsAt: session.breakEndsAt || null,

        nextBreakReminderFocusMilliseconds:
          Number(session.nextBreakReminderFocusMilliseconds) ||
          BREAK_REMINDER_INTERVAL_MS,
      };
    } catch {
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem(
      "focusflow-active-session",
      JSON.stringify(activeSession),
    );
  }, [activeSession]);

  function startSession(activity, category) {
    if (activeSession) {
      return;
    }

    setActiveSession({
      id: crypto.randomUUID(),
      activity: activity.trim(),
      category,
      startedAt: new Date().toISOString(),

      totalBreakMilliseconds: 0,
      breakStartedAt: null,
      breakEndsAt: null,

      nextBreakReminderFocusMilliseconds: BREAK_REMINDER_INTERVAL_MS,
    });
  }

  function startBreak(durationMinutes) {
    const safeDuration = Number(durationMinutes);

    if (!Number.isFinite(safeDuration) || safeDuration <= 0) {
      return;
    }

    setActiveSession((previous) => {
      if (!previous || previous.breakStartedAt) {
        return previous;
      }

      const now = Date.now();
      const focusMilliseconds = getFocusMilliseconds(previous, now);

      return {
        ...previous,
        breakStartedAt: new Date(now).toISOString(),

        breakEndsAt: new Date(now + safeDuration * 60 * 1000).toISOString(),

        nextBreakReminderFocusMilliseconds:
          focusMilliseconds + BREAK_REMINDER_INTERVAL_MS,
      };
    });
  }

  function resumeSession() {
    setActiveSession((previous) => {
      if (!previous || !previous.breakStartedAt) {
        return previous;
      }

      const now = Date.now();

      const breakStartedAt = new Date(previous.breakStartedAt).getTime();

      const currentBreakMilliseconds = Number.isNaN(breakStartedAt)
        ? 0
        : Math.max(0, now - breakStartedAt);

      return {
        ...previous,

        totalBreakMilliseconds:
          (Number(previous.totalBreakMilliseconds) || 0) +
          currentBreakMilliseconds,

        breakStartedAt: null,
        breakEndsAt: null,
      };
    });
  }

  function skipBreakReminder() {
    setActiveSession((previous) => {
      if (!previous || previous.breakStartedAt) {
        return previous;
      }

      const focusMilliseconds = getFocusMilliseconds(previous);

      return {
        ...previous,

        nextBreakReminderFocusMilliseconds:
          focusMilliseconds + BREAK_REMINDER_INTERVAL_MS,
      };
    });
  }

  function stopSession() {
    if (!activeSession) {
      return;
    }

    const start = new Date(activeSession.startedAt);

    const end = new Date();

    const focusMilliseconds = getFocusMilliseconds(
      activeSession,
      end.getTime(),
    );

    const totalMinutes = Math.max(1, Math.ceil(focusMilliseconds / 60000));

    const hours = Math.floor(totalMinutes / 60);

    const minutes = totalMinutes % 60;

    const newActivity = {
      id: crypto.randomUUID(),
      activity: activeSession.activity,
      category: activeSession.category,

      date: [
        start.getFullYear(),
        String(start.getMonth() + 1).padStart(2, "0"),
        String(start.getDate()).padStart(2, "0"),
      ].join("-"),

      startTime: start.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),

      endTime: end.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),

      duration: `${hours}h ${minutes}m`,
      durationMinutes: totalMinutes,
      notes: "",
      entryType: "live",
      createdAt: end.toISOString(),
    };

    setActivities((previous) => [...previous, newActivity]);

    setActiveSession(null);
  }

  return (
    <ActivityContext.Provider
      value={{
        activities,
        activeSession,
        addActivity,
        deleteActivity,
        startSession,
        stopSession,
        startBreak,
        resumeSession,
        skipBreakReminder,
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
}
