const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

function getRequiredEnvironmentVariable(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getCaCertificate() {
  if (process.env.DB_SSL_CA_BASE64) {
    return Buffer.from(process.env.DB_SSL_CA_BASE64, "base64").toString("utf8");
  }

  const certificatePath = path.resolve(
    __dirname,
    "../..",
    getRequiredEnvironmentVariable("DB_SSL_CA"),
  );

  return fs.readFileSync(certificatePath, "utf8");
}

const pool = mysql.createPool({
  host: getRequiredEnvironmentVariable("DB_HOST"),
  port: Number(getRequiredEnvironmentVariable("DB_PORT")),
  user: getRequiredEnvironmentVariable("DB_USER"),
  password: getRequiredEnvironmentVariable("DB_PASSWORD"),
  database: getRequiredEnvironmentVariable("DB_NAME"),

  ssl: {
    ca: getCaCertificate(),
    rejectUnauthorized: true,
  },

  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
});

async function initializeDatabase() {
  await pool.query("SELECT 1");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS snapshots (
      device_id VARCHAR(36) NOT NULL,
      data JSON NOT NULL,
      updated_at TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (device_id)
    )
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = utf8mb4
    COLLATE = utf8mb4_unicode_ci
  `);

  console.log("Connected to Aiven MySQL.");
  console.log("Snapshots table is ready.");
}

module.exports = {
  pool,
  initializeDatabase,
};
