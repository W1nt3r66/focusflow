import { useEffect } from "react";
import { saveCloudSnapshot } from "../services/cloudBackup";

const backupIntervalMilliseconds = 30 * 1000;

function CloudBackup() {
  useEffect(() => {
    let isSyncing = false;

    async function syncSnapshot() {
      if (isSyncing || !navigator.onLine) {
        return;
      }

      isSyncing = true;

      try {
        await saveCloudSnapshot();
      } catch (error) {
        console.warn("FocusFlow cloud backup is currently unavailable.", error);
      } finally {
        isSyncing = false;
      }
    }

    const initialBackup = window.setTimeout(syncSnapshot, 2000);

    const backupInterval = window.setInterval(
      syncSnapshot,
      backupIntervalMilliseconds,
    );

    function handleOnline() {
      syncSnapshot();
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") {
        syncSnapshot();
      }
    }

    window.addEventListener("online", handleOnline);

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearTimeout(initialBackup);
      window.clearInterval(backupInterval);

      window.removeEventListener("online", handleOnline);

      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null;
}

export default CloudBackup;
