import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#27AE60", // Study
  "#F2994A", // Fitness
  "#F2C94C", // Break
  "#9B51E0", // Work
  "#EB5757", // Personal
];

function WeeklyPieChart({ activities }) {
  const categories = ["Study", "Fitness", "Break", "Work", "Personal"];

  const data = categories.map((category) => {
    const total = activities
      .filter((item) => item.category === category)
      .reduce((sum, item) => sum + item.durationMinutes, 0);

    return {
      name: category,
      value: total,
    };
  });

  return (
    <div
      style={{
        width: "100%",
        height: 280,
        marginTop: 20,
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" outerRadius={80} label>
            {data.map((entry, index) => (
              <Cell key={index} fill={COLORS[index]} />
            ))}
          </Pie>

          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default WeeklyPieChart;
