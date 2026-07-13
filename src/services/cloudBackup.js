const apiUrl = (
  import.meta.env.VITE_API_URL || "http://localhost:5050/api"
).replace(/\/$/, "");

const deviceIdKey = "focusflow-device-id";

const backupKeys = [
  "focusflow-activities",
  "focusflow-active-session",
  "focusflow-goals",
  "focusflow-display-name",
  "focusflow-theme",
];

export function getDeviceId() {
  const savedDeviceId = localStorage.getItem(deviceIdKey);

  if (savedDeviceId) {
    return savedDeviceId;
  }

  const newDeviceId = crypto.randomUUID();

  localStorage.setItem(deviceIdKey, newDeviceId);

  return newDeviceId;
}

function createSnapshot() {
  const values = {};

  backupKeys.forEach((key) => {
    values[key] = localStorage.getItem(key);
  });

  return {
    version: 1,
    savedAt: new Date().toISOString(),
    values,
  };
}

export async function saveCloudSnapshot() {
  const deviceId = getDeviceId();

  const response = await fetch(`${apiUrl}/snapshot/${deviceId}`, {
    method: "PUT",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      data: createSnapshot(),
    }),
  });

  if (!response.ok) {
    throw new Error(`Cloud backup failed with status ${response.status}.`);
  }

  localStorage.setItem("focusflow-last-cloud-sync", new Date().toISOString());

  return response.json();
}

export async function getCloudSnapshot() {
  const deviceId = getDeviceId();

  const response = await fetch(`${apiUrl}/snapshot/${deviceId}`);

  if (!response.ok) {
    throw new Error(`Cloud restore failed with status ${response.status}.`);
  }

  return response.json();
}
