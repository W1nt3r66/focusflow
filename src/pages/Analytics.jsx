import { useContext, useMemo } from "react";
import AnalyticsExport from "../components/AnalyticsExport";
import {
  BarChart3,
  CalendarDays,
  Clock3,
  Flame,
  Target,
  Trophy,
} from "lucide-react";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import AppHeader from "../components/AppHeader";
import StreakCard from "../components/StreakCard";
import { ActivityContext } from "../context/ActivityContext";
import "./Analytics.css";

const focusCategories = ["Study", "Work", "Fitness"];

const categoryColors = {
  Study: "#22a866",
  Work: "#9956e8",
  Fitness: "#f28b3c",
};

function formatMinutes(totalMinutes) {
  const safeMinutes = Number(totalMinutes) || 0;
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;

  if (hours === 0) {
    return `${minutes}m`;
  }

  return `${hours}h ${minutes}m`;
}

function getLocalDateKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function Analytics() {
  const { activities } = useContext(ActivityContext);

  const analytics = useMemo(() => {
    const now = new Date();
    const todayKey = getLocalDateKey(now);
    const weekDates = [];

    for (let offset = 6; offset >= 0; offset -= 1) {
      const date = new Date(now);

      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - offset);

      weekDates.push({
        key: getLocalDateKey(date),

        label: date.toLocaleDateString("en-IN", {
          weekday: "short",
        }),

        fullLabel: date.toLocaleDateString("en-IN", {
          weekday: "long",
        }),
      });
    }

    const focusActivities = activities.filter(
      (item) =>
        focusCategories.includes(item.category) &&
        Number(item.durationMinutes) > 0,
    );

    const todayMinutes = focusActivities
      .filter((item) => item.date === todayKey)
      .reduce((total, item) => total + Number(item.durationMinutes || 0), 0);

    const weekDateKeys = new Set(weekDates.map((day) => day.key));

    const weeklyActivities = focusActivities.filter((item) =>
      weekDateKeys.has(item.date),
    );

    const weeklyMinutes = weeklyActivities.reduce(
      (total, item) => total + Number(item.durationMinutes || 0),
      0,
    );

    const trendData = weekDates.map((day) => {
      const minutes = weeklyActivities
        .filter((item) => item.date === day.key)
        .reduce((total, item) => total + Number(item.durationMinutes || 0), 0);

      return {
        day: day.label,
        fullDay: day.fullLabel,
        minutes,
        hours: Number((minutes / 60).toFixed(2)),
      };
    });

    const distributionData = focusCategories
      .map((category) => {
        const minutes = weeklyActivities
          .filter((item) => item.category === category)
          .reduce(
            (total, item) => total + Number(item.durationMinutes || 0),
            0,
          );

        return {
          name: category,
          minutes,
          value: minutes,
        };
      })
      .filter((item) => item.minutes > 0);

    const mostUsedCategory =
      [...distributionData].sort(
        (first, second) => second.minutes - first.minutes,
      )[0] || null;

    const longestSession =
      [...focusActivities].sort(
        (first, second) =>
          Number(second.durationMinutes || 0) -
          Number(first.durationMinutes || 0),
      )[0] || null;

    const mostProductiveDay =
      [...trendData].sort(
        (first, second) => second.minutes - first.minutes,
      )[0] || null;

    const activeDays = trendData.filter((day) => day.minutes > 0).length;

    const averageDailyMinutes =
      activeDays > 0 ? Math.round(weeklyMinutes / activeDays) : 0;

    const previousThreeDays = trendData
      .slice(1, 4)
      .reduce((total, day) => total + day.minutes, 0);

    const latestThreeDays = trendData
      .slice(4, 7)
      .reduce((total, day) => total + day.minutes, 0);

    let recentTrend = "No trend yet";

    if (previousThreeDays > 0) {
      const change = Math.round(
        ((latestThreeDays - previousThreeDays) / previousThreeDays) * 100,
      );

      recentTrend = change >= 0 ? `Up ${change}%` : `Down ${Math.abs(change)}%`;
    } else if (latestThreeDays > 0) {
      recentTrend = "Focus increasing";
    }

    return {
      todayMinutes,
      weeklyMinutes,
      trendData,
      distributionData,
      mostUsedCategory,
      longestSession,
      mostProductiveDay,
      averageDailyMinutes,
      recentTrend,
    };
  }, [activities]);

  const hasAnalytics = analytics.weeklyMinutes > 0;

  return (
    <div className="analytics-page">
      <AppHeader />

      <header className="analytics-header">
        <div>
          <p className="analytics-eyebrow">Focus insights</p>

          <h1>Analytics</h1>

          <p>
            Understand how you have spent your focus time over the last seven
            days.
          </p>
        </div>

        <div className="analytics-header-actions">
          <AnalyticsExport />

          <div className="analytics-period">
            <CalendarDays size={18} />
            Last 7 days
          </div>
        </div>
      </header>

      <StreakCard />

      <section className="analytics-summary-grid">
        <article className="analytics-summary-card">
          <div className="analytics-icon">
            <Clock3 size={20} />
          </div>

          <p>Today&apos;s Focus</p>

          <strong>{formatMinutes(analytics.todayMinutes)}</strong>
        </article>

        <article className="analytics-summary-card">
          <div className="analytics-icon">
            <BarChart3 size={20} />
          </div>

          <p>Weekly Total</p>

          <strong>{formatMinutes(analytics.weeklyMinutes)}</strong>
        </article>

        <article className="analytics-summary-card">
          <div className="analytics-icon">
            <Target size={20} />
          </div>

          <p>Daily Average</p>

          <strong>{formatMinutes(analytics.averageDailyMinutes)}</strong>
        </article>

        <article className="analytics-summary-card">
          <div className="analytics-icon">
            <Flame size={20} />
          </div>

          <p>Recent Trend</p>

          <strong>{analytics.recentTrend}</strong>
        </article>
      </section>

      {!hasAnalytics ? (
        <section className="analytics-empty">
          <BarChart3 size={30} />

          <h2>No focus data yet</h2>

          <p>
            Complete a Study, Work, or Fitness session to begin generating
            insights.
          </p>
        </section>
      ) : (
        <>
          <section className="analytics-chart-grid">
            <article className="analytics-panel">
              <div className="analytics-panel-heading">
                <div>
                  <p>Daily movement</p>
                  <h2>Focus Trend</h2>
                </div>

                <span>Hours</span>
              </div>

              <div className="analytics-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={analytics.trendData}
                    margin={{
                      top: 15,
                      right: 12,
                      left: -20,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid strokeDasharray="4 4" vertical={false} />

                    <XAxis dataKey="day" axisLine={false} tickLine={false} />

                    <YAxis axisLine={false} tickLine={false} allowDecimals />

                    <Tooltip
                      formatter={(value) => [
                        formatMinutes(Math.round(Number(value) * 60)),
                        "Focus",
                      ]}
                      labelFormatter={(_, payload) =>
                        payload?.[0]?.payload?.fullDay || ""
                      }
                    />

                    <Line
                      type="monotone"
                      dataKey="hours"
                      stroke="var(--primary)"
                      strokeWidth={3}
                      dot={{
                        r: 4,
                        fill: "var(--primary)",
                      }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="analytics-panel">
              <div className="analytics-panel-heading">
                <div>
                  <p>Time allocation</p>
                  <h2>Weekly Distribution</h2>
                </div>
              </div>

              <div className="analytics-donut-layout">
                <div className="analytics-donut">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.distributionData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius="67%"
                        outerRadius="90%"
                        paddingAngle={4}
                      >
                        {analytics.distributionData.map((item) => (
                          <Cell
                            key={item.name}
                            fill={categoryColors[item.name]}
                          />
                        ))}
                      </Pie>

                      <Tooltip formatter={(value) => formatMinutes(value)} />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="analytics-donut-center">
                    <strong>{formatMinutes(analytics.weeklyMinutes)}</strong>

                    <span>Total</span>
                  </div>
                </div>

                <div className="analytics-legend">
                  {analytics.distributionData.map((item) => (
                    <div className="analytics-legend-row" key={item.name}>
                      <span
                        className="analytics-legend-dot"
                        style={{
                          background: categoryColors[item.name],
                        }}
                      />

                      <span>{item.name}</span>

                      <strong>{formatMinutes(item.minutes)}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          </section>

          <section className="analytics-insights-grid">
            <article className="analytics-insight">
              <Trophy size={20} />

              <div>
                <p>Most Used Category</p>

                <strong>{analytics.mostUsedCategory?.name || "No data"}</strong>

                <span>
                  {analytics.mostUsedCategory
                    ? formatMinutes(analytics.mostUsedCategory.minutes)
                    : "—"}
                </span>
              </div>
            </article>

            <article className="analytics-insight">
              <Clock3 size={20} />

              <div>
                <p>Longest Session</p>

                <strong>
                  {analytics.longestSession?.activity || "No data"}
                </strong>

                <span>
                  {analytics.longestSession
                    ? formatMinutes(analytics.longestSession.durationMinutes)
                    : "—"}
                </span>
              </div>
            </article>

            <article className="analytics-insight">
              <CalendarDays size={20} />

              <div>
                <p>Most Productive Day</p>

                <strong>
                  {analytics.mostProductiveDay?.minutes > 0
                    ? analytics.mostProductiveDay.fullDay
                    : "No data"}
                </strong>

                <span>
                  {analytics.mostProductiveDay?.minutes > 0
                    ? formatMinutes(analytics.mostProductiveDay.minutes)
                    : "—"}
                </span>
              </div>
            </article>
          </section>
        </>
      )}
    </div>
  );
}

export default Analytics;
