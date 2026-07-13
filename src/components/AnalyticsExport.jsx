import { useContext, useState } from "react";
import { Download, FileText, X } from "lucide-react";
import { ActivityContext } from "../context/ActivityContext";
import { SettingsContext } from "../context/SettingsContext";
import "./AnalyticsExport.css";

const focusCategories = ["Study", "Work", "Fitness"];

function getDateKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function getInitialStartDate() {
  const date = new Date();
  date.setDate(date.getDate() - 6);

  return getDateKey(date);
}

function formatMinutes(totalMinutes) {
  const minutes = Number(totalMinutes) || 0;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${hours}h ${remainingMinutes}m`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function AnalyticsExport({ settingsMode = false }) {
  const { activities } = useContext(ActivityContext);
  const { displayName } = useContext(SettingsContext);

  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState(getInitialStartDate);
  const [endDate, setEndDate] = useState(() => getDateKey(new Date()));
  const [error, setError] = useState("");

  const reportOwner =
    typeof displayName === "string" && displayName.trim()
      ? displayName.trim()
      : "FocusFlow User";

  function closeExport() {
    setIsOpen(false);
    setError("");
  }

  function generateReport() {
    if (!startDate || !endDate) {
      setError("Select both a start and end date.");
      return;
    }

    if (startDate > endDate) {
      setError("The start date must be before the end date.");
      return;
    }

    const selectedActivities = activities
      .filter((item) => item.date >= startDate && item.date <= endDate)
      .sort((first, second) => {
        const firstDate = new Date(
          `${first.date}T${first.startTime || "00:00"}`,
        );

        const secondDate = new Date(
          `${second.date}T${second.startTime || "00:00"}`,
        );

        return firstDate - secondDate;
      });

    if (selectedActivities.length === 0) {
      setError("No activities were found in this date range.");
      return;
    }

    const focusActivities = selectedActivities.filter((item) =>
      focusCategories.includes(item.category),
    );

    const totalFocusMinutes = focusActivities.reduce(
      (total, item) => total + Number(item.durationMinutes || 0),
      0,
    );

    const categoryTotals = [
      "Study",
      "Work",
      "Fitness",
      "Personal",
      "Break",
    ].map((category) => ({
      category,
      minutes: selectedActivities
        .filter((item) => item.category === category)
        .reduce((total, item) => total + Number(item.durationMinutes || 0), 0),
    }));

    const longestSession = [...selectedActivities].sort(
      (first, second) =>
        Number(second.durationMinutes || 0) -
        Number(first.durationMinutes || 0),
    )[0];

    const focusByDate = focusActivities.reduce((dates, item) => {
      dates[item.date] =
        (dates[item.date] || 0) + Number(item.durationMinutes || 0);

      return dates;
    }, {});

    const productiveDay = Object.entries(focusByDate).sort(
      (first, second) => second[1] - first[1],
    )[0];

    const activeDays = Object.keys(focusByDate).length;

    const averageDailyMinutes =
      activeDays > 0 ? Math.round(totalFocusMinutes / activeDays) : 0;

    const reportWindow = window.open("", "_blank");

    if (!reportWindow) {
      setError("The report window was blocked. Allow popups and try again.");
      return;
    }

    const logoUrl = new URL("/focusflow-logo.svg", window.location.origin).href;

    const categoryRows = categoryTotals
      .map(
        (item) => `
          <tr>
            <td>${escapeHtml(item.category)}</td>
            <td>${escapeHtml(formatMinutes(item.minutes))}</td>
          </tr>
        `,
      )
      .join("");

    const activityRows = selectedActivities
      .map(
        (item) => `
          <tr>
            <td>${escapeHtml(item.date)}</td>
            <td>${escapeHtml(item.activity)}</td>
            <td>${escapeHtml(item.category)}</td>
            <td>
              ${escapeHtml(item.startTime)}
              &ndash;
              ${escapeHtml(item.endTime)}
            </td>
            <td>${escapeHtml(item.duration)}</td>
            <td>${escapeHtml(item.entryType || "manual")}</td>
          </tr>
        `,
      )
      .join("");

    reportWindow.document.write(`
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />

          <meta
            name="viewport"
            content="width=device-width, initial-scale=1"
          />

          <title>
            ${escapeHtml(reportOwner)} - FocusFlow Analytics -
            ${escapeHtml(startDate)} to ${escapeHtml(endDate)}
          </title>

          <style>
            * {
              box-sizing: border-box;

              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            body {
              margin: 0;
              padding: 40px;

              color: #172033;
              background: #ffffff;

              font-family:
                Inter,
                -apple-system,
                BlinkMacSystemFont,
                "Segoe UI",
                sans-serif;
            }

            header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 24px;

              padding-bottom: 22px;

              border-bottom: 2px solid #315fa8;
            }

            .brand {
              display: flex;
              align-items: center;
              gap: 14px;
            }

            .brand-logo {
              display: block;

              width: 54px;
              height: 54px;

              border-radius: 14px;
            }

            h1 {
              margin: 0;

              font-size: 32px;
              letter-spacing: -1px;
            }

            header p {
              margin: 5px 0 0;

              color: #64748b;
            }

            .range {
              color: #315fa8;

              font-size: 13px;
              font-weight: 700;
              line-height: 1.5;
              text-align: right;
            }

            .report-owner {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 20px;

              margin-top: 22px;
              padding: 15px 18px;

              background: #f4f7fb;
              border-left: 4px solid #315fa8;
              border-radius: 10px;
            }

            .report-owner span {
              color: #64748b;

              font-size: 11px;
              font-weight: 700;
              letter-spacing: 0.04em;
              text-transform: uppercase;
            }

            .report-owner strong {
              color: #172033;

              font-size: 18px;
            }

            .summary {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 12px;

              margin: 24px 0;
            }

            .summary-card {
              padding: 16px;

              background: #f4f7fb;

              border-radius: 12px;
            }

            .summary-card span {
              display: block;

              color: #64748b;

              font-size: 11px;
              font-weight: 700;
            }

            .summary-card strong {
              display: block;

              margin-top: 7px;

              font-size: 19px;
            }

            section {
              margin-top: 28px;
            }

            h2 {
              margin: 0 0 12px;

              font-size: 19px;
            }

            table {
              width: 100%;

              border-collapse: collapse;
            }

            th,
            td {
              padding: 10px 8px;

              border-bottom: 1px solid #e2e8f0;

              font-size: 11px;
              text-align: left;
            }

            th {
              color: #64748b;
              background: #f8fafc;

              font-weight: 700;
              text-transform: uppercase;
            }

            footer {
              margin-top: 30px;
              padding-top: 16px;

              color: #94a3b8;

              border-top: 1px solid #e2e8f0;

              font-size: 10px;
              text-align: center;
            }

            @page {
              size: A4;
              margin: 14mm;
            }

            @media print {
              body {
                padding: 0;
              }

              tr {
                break-inside: avoid;
              }
            }
          </style>
        </head>

        <body>
          <header>
            <div class="brand">
              <img
                class="brand-logo"
                src="${escapeHtml(logoUrl)}"
                alt="FocusFlow logo"
              />

              <div>
                <h1>FocusFlow</h1>
                <p>Focus activity report</p>
              </div>
            </div>

            <div class="range">
              ${escapeHtml(startDate)}
              <br />
              to
              <br />
              ${escapeHtml(endDate)}
            </div>
          </header>

          <div class="report-owner">
            <span>Analytics report prepared for</span>
            <strong>${escapeHtml(reportOwner)}</strong>
          </div>

          <div class="summary">
            <div class="summary-card">
              <span>TOTAL FOCUS</span>

              <strong>
                ${escapeHtml(formatMinutes(totalFocusMinutes))}
              </strong>
            </div>

            <div class="summary-card">
              <span>SESSIONS</span>
              <strong>${selectedActivities.length}</strong>
            </div>

            <div class="summary-card">
              <span>DAILY AVERAGE</span>

              <strong>
                ${escapeHtml(formatMinutes(averageDailyMinutes))}
              </strong>
            </div>

            <div class="summary-card">
              <span>ACTIVE DAYS</span>
              <strong>${activeDays}</strong>
            </div>
          </div>

          <div class="summary">
            <div class="summary-card">
              <span>LONGEST SESSION</span>

              <strong>
                ${escapeHtml(longestSession?.duration || "0m")}
              </strong>
            </div>

            <div class="summary-card">
              <span>LONGEST ACTIVITY</span>

              <strong>
                ${escapeHtml(longestSession?.activity || "No data")}
              </strong>
            </div>

            <div class="summary-card">
              <span>MOST PRODUCTIVE DAY</span>

              <strong>
                ${escapeHtml(productiveDay?.[0] || "No data")}
              </strong>
            </div>

            <div class="summary-card">
              <span>PRODUCTIVE DAY FOCUS</span>

              <strong>
                ${escapeHtml(formatMinutes(productiveDay?.[1] || 0))}
              </strong>
            </div>
          </div>

          <section>
            <h2>Category Breakdown</h2>

            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Total time</th>
                </tr>
              </thead>

              <tbody>${categoryRows}</tbody>
            </table>
          </section>

          <section>
            <h2>Activity History</h2>

            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Activity</th>
                  <th>Category</th>
                  <th>Time</th>
                  <th>Duration</th>
                  <th>Type</th>
                </tr>
              </thead>

              <tbody>${activityRows}</tbody>
            </table>
          </section>

          <footer>
            FocusFlow analytics report for
            ${escapeHtml(reportOwner)}.
            Generated on
            ${escapeHtml(new Date().toLocaleString("en-IN"))}.
          </footer>

          <script>
            window.addEventListener("load", function () {
              setTimeout(function () {
                window.print();
              }, 300);
            });
          </script>
        </body>
      </html>
    `);

    reportWindow.document.close();
    closeExport();
  }

  return (
    <>
      <button
        type="button"
        className={
          settingsMode ? "settings-row settings-action" : "analytics-export-btn"
        }
        onClick={() => setIsOpen(true)}
      >
        <Download size={17} />

        {settingsMode ? (
          <div>
            <strong>Export activities</strong>

            <small>Create a report for a selected date range</small>
          </div>
        ) : (
          <span>Export Report</span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="analytics-export-overlay"
            onClick={closeExport}
            aria-hidden="true"
          />

          <section
            className="analytics-export-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="export-title"
          >
            <button
              type="button"
              className="analytics-export-close"
              onClick={closeExport}
              aria-label="Close export"
            >
              <X size={18} />
            </button>

            <div className="analytics-export-icon">
              <FileText size={23} />
            </div>

            <p className="analytics-export-eyebrow">PDF report</p>

            <h2 id="export-title">Export Analytics</h2>

            <p className="analytics-export-description">
              The report will be prepared for <strong>{reportOwner}</strong>.
              Select a date range below.
            </p>

            <div className="analytics-export-fields">
              <label>
                From
                <input
                  type="date"
                  value={startDate}
                  max={endDate}
                  onChange={(event) => {
                    setStartDate(event.target.value);
                    setError("");
                  }}
                />
              </label>

              <label>
                To
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  max={getDateKey(new Date())}
                  onChange={(event) => {
                    setEndDate(event.target.value);
                    setError("");
                  }}
                />
              </label>
            </div>

            {error && <p className="analytics-export-error">{error}</p>}

            <button
              type="button"
              className="generate-report-btn"
              onClick={generateReport}
            >
              <Download size={17} />
              Generate PDF
            </button>

            <p className="analytics-export-help">
              In the print window, choose “Save as PDF.”
            </p>
          </section>
        </>
      )}
    </>
  );
}

export default AnalyticsExport;
