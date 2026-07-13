require("dotenv").config();

const app = require("./app");
const { initializeDatabase } = require("./config/database");

const port = Number(process.env.PORT) || 5000;

async function startServer() {
  try {
    await initializeDatabase();

    app.listen(port, () => {
      console.log(`FocusFlow API running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Unable to start FocusFlow API.");
    console.error(error.message);

    process.exit(1);
  }
}

startServer();
