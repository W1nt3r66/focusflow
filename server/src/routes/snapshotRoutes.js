const express = require("express");
const { pool } = require("../config/database");

const router = express.Router();

const deviceIdPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidDeviceId(deviceId) {
  return deviceIdPattern.test(deviceId);
}

router.get("/:deviceId", async (request, response, next) => {
  try {
    const { deviceId } = request.params;

    if (!isValidDeviceId(deviceId)) {
      response.status(400).json({
        success: false,
        message: "Invalid device ID.",
      });

      return;
    }

    const [rows] = await pool.execute(
      `
        SELECT data, updated_at AS updatedAt
        FROM snapshots
        WHERE device_id = ?
      `,
      [deviceId],
    );

    if (rows.length === 0) {
      response.status(200).json({
        success: true,
        snapshot: null,
      });

      return;
    }

    const storedData =
      typeof rows[0].data === "string"
        ? JSON.parse(rows[0].data)
        : rows[0].data;

    response.status(200).json({
      success: true,
      snapshot: {
        data: storedData,
        updatedAt: rows[0].updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.put("/:deviceId", async (request, response, next) => {
  try {
    const { deviceId } = request.params;
    const { data } = request.body;

    if (!isValidDeviceId(deviceId)) {
      response.status(400).json({
        success: false,
        message: "Invalid device ID.",
      });

      return;
    }

    if (!data || typeof data !== "object" || Array.isArray(data)) {
      response.status(400).json({
        success: false,
        message: "Snapshot data must be an object.",
      });

      return;
    }

    await pool.execute(
      `
        INSERT INTO snapshots (device_id, data)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE
          data = VALUES(data),
          updated_at = CURRENT_TIMESTAMP
      `,
      [deviceId, JSON.stringify(data)],
    );

    response.status(200).json({
      success: true,
      message: "Snapshot saved successfully.",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
