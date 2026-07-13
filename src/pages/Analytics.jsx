import { useContext, useMemo, useState } from "react";
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
import AnalyticsExport from "../components/AnalyticsExport";
import AppHeader from "../components/AppHeader";
import StreakCard from "../components/StreakCard";
import { ActivityContext } from "../context/ActivityContext";
import "./Analytics.css";

const focusCategories = ["Study", "Work", "Fitness"];
const rangeOptions = [7, 30, 365];

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

  const [rangeDays, setRangeDays] = useState(7);

  function cycleRange() {
    const currentIndex = rangeOptions.indexOf(rangeDays);
    const nextIndex = (currentIndex + 1) % rangeOptions.length;

    setRangeDays(rangeOptions[nextIndex]);
  }

  const analytics = useMemo(() => {
    const now = new Date();
    const todayKey = getLocalDateKey(now);
    const rangeDates = [];

    for (let offset = rangeDays - 1; offset >= 0; offset -= 1) {
      const date = new Date(now);

      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - offset);

      let shortLabel;

      if (rangeDays === 7) {
        shortLabel = date.toLocaleDateString("en-IN", {
          weekday: "short",
        });
      } else {
        shortLabel = date.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
        });
      }

      rangeDates.push({
        key: getLocalDateKey(date),
        label: shortLabel,
        fullLabel: date.toLocaleDateString("en-IN", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
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

    const rangeDateKeys = new Set(rangeDates.map((day) => day.key));

    const periodActivities = focusActivities.filter((item) =>
      rangeDateKeys.has(item.date),
    );

    const periodMinutes = periodActivities.reduce(
      (total, item) => total + Number(item.durationMinutes || 0),
      0,
    );

    const minutesByDate = periodActivities.reduce((totals, item) => {
      totals[item.date] =
        (totals[item.date] || 0) + Number(item.durationMinutes || 0);

      return totals;
    }, {});

    const trendData = rangeDates.map((day) => {
      const minutes = minutesByDate[day.key] || 0;

      return {
        day: day.label,
        fullDay: day.fullLabel,
        minutes,
        hours: Number((minutes / 60).toFixed(2)),
      };
    });

    const distributionData = focusCategories
      .map((category) => {
        const minutes = periodActivities
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
      [...periodActivities].sort(
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
      activeDays > 0 ? Math.round(periodMinutes / activeDays) : 0;

    const comparisonDays = rangeDays === 7 ? 3 : rangeDays === 30 ? 7 : 30;

    const latestPeriodMinutes = trendData
      .slice(-comparisonDays)
      .reduce((total, day) => total + day.minutes, 0);

    const previousPeriodMinutes = trendData
      .slice(-comparisonDays * 2, -comparisonDays)
      .reduce((total, day) => total + day.minutes, 0);

    let recentTrend = "No trend yet";

    if (previousPeriodMinutes > 0) {
      const change = Math.round(
        ((latestPeriodMinutes - previousPeriodMinutes) /
          previousPeriodMinutes) *
          100,
      );

      recentTrend = change >= 0 ? `Up ${change}%` : `Down ${Math.abs(change)}%`;
    } else if (latestPeriodMinutes > 0) {
      recentTrend = "Focus increasing";
    }

    const xAxisInterval = rangeDays === 7 ? 0 : rangeDays === 30 ? 4 : 59;

    return {
      todayMinutes,
      periodMinutes,
      trendData,
      distributionData,
      mostUsedCategory,
      longestSession,
      mostProductiveDay,
      averageDailyMinutes,
      recentTrend,
      xAxisInterval,
    };
  }, [activities, rangeDays]);

  const hasAnalytics = analytics.periodMinutes > 0;

  return (
    <div className="analytics-page">
      <AppHeader />

      <header className="analytics-header">
        <div>
          <p className="analytics-eyebrow">Focus insights</p>

          <h1>Analytics</h1>

          <p>
            Understand how you have spent your focus time over the last{" "}
            {rangeDays} days.
          </p>
        </div>

        <div className="analytics-header-actions">
          <AnalyticsExport />

          <button
            type="button"
            className="analytics-period"
            onClick={cycleRange}
            title="Click to change analytics period"
            aria-label={`Showing the last ${rangeDays} days. Click to change period.`}
          >
            <CalendarDays size={18} />
            Last {rangeDays} days
          </button>
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

          <p>{rangeDays}-Day Total</p>

          <strong>{formatMinutes(analytics.periodMinutes)}</strong>
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

          <h2>No focus data for this period</h2>

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

                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      interval={analytics.xAxisInterval}
                      minTickGap={18}
                    />

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
                      dot={
                        rangeDays <= 30
                          ? {
                              r: 4,
                              fill: "var(--primary)",
                            }
                          : false
                      }
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
                  <h2>{rangeDays}-Day Distribution</h2>
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
                    <strong>{formatMinutes(analytics.periodMinutes)}</strong>

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
