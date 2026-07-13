const cors = require("cors");
const express = require("express");

const snapshotRoutes = require("./routes/snapshotRoutes");

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:4173",
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("This origin is not allowed by CORS."));
    },
  }),
);

app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_request, response) => {
  response.status(200).json({
    success: true,
    message: "FocusFlow API is running.",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/snapshot", snapshotRoutes);

app.use((request, response) => {
  response.status(404).json({
    success: false,
    message: "API route not found.",
  });
});

app.use((error, _request, response, _next) => {
  console.error(error);

  response.status(error.status || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Something went wrong."
        : error.message,
  });
});

module.exports = app;
