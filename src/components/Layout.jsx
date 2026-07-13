import { useContext, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import AppFooter from "./AppFooter";
import {
  ActivityContext,
  getFocusMilliseconds,
} from "../context/ActivityContext";
import BottomNav from "./BottomNav";
import BreakReminderPopup from "./BreakReminderPopup";
import CurrentSessionModal from "./CurrentSessionModal";
import GlobalActions from "./GlobalActions";
import LiveSessionModal from "./LiveSessionModal";
import SettingsDrawer from "./SettingsDrawer";

function Layout() {
  const {
    activeSession,
    startSession,
    stopSession,
    startBreak,
    resumeSession,
    skipBreakReminder,
  } = useContext(ActivityContext);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [isLiveModalOpen, setIsLiveModalOpen] = useState(false);

  const [isCurrentSessionModalOpen, setIsCurrentSessionModalOpen] =
    useState(false);

  const [isBreakReminderOpen, setIsBreakReminderOpen] = useState(false);

  const [liveActivity, setLiveActivity] = useState("");

  const [liveCategory, setLiveCategory] = useState("Study");

  useEffect(() => {
    if (!activeSession || activeSession.breakStartedAt) {
      return;
    }

    function checkBreakReminder() {
      const focusMilliseconds = getFocusMilliseconds(activeSession);

      const reminderAt =
        Number(activeSession.nextBreakReminderFocusMilliseconds) ||
        50 * 60 * 1000;

      if (focusMilliseconds >= reminderAt) {
        setIsBreakReminderOpen(true);
      }
    }

    const initialCheck = setTimeout(checkBreakReminder, 0);

    const interval = setInterval(checkBreakReminder, 1000);

    return () => {
      clearTimeout(initialCheck);
      clearInterval(interval);
    };
  }, [activeSession]);

  function startLiveSession() {
    const trimmedActivity = liveActivity.trim();

    if (!trimmedActivity) {
      alert("Please enter an activity name.");
      return;
    }

    if (activeSession) {
      setIsCurrentSessionModalOpen(true);
      return;
    }

    startSession(trimmedActivity, liveCategory);

    setLiveActivity("");
    setLiveCategory("Study");
    setIsLiveModalOpen(false);
    setIsBreakReminderOpen(false);
  }

  function openLiveSessionModal() {
    if (activeSession) {
      setIsCurrentSessionModalOpen(true);
      return;
    }

    setIsLiveModalOpen(true);
  }

  function openCurrentSessionModal() {
    if (activeSession) {
      setIsCurrentSessionModalOpen(true);
    }
  }

  function handleStartBreak(minutes) {
    startBreak(minutes);
    setIsBreakReminderOpen(false);
    setIsCurrentSessionModalOpen(false);
  }

  function handleResumeSession() {
    resumeSession();
  }

  function handleSkipBreak() {
    skipBreakReminder();
    setIsBreakReminderOpen(false);
  }

  function handleStopSession() {
    stopSession();
    setIsBreakReminderOpen(false);
    setIsCurrentSessionModalOpen(false);
  }

  return (
    <>
      <GlobalActions
        activeSession={activeSession}
        onLiveSessionClick={openLiveSessionModal}
        onRunningSessionClick={openCurrentSessionModal}
        onSettingsClick={() => setIsSettingsOpen(true)}
      />

      <main className="page-content">
        <Outlet
          context={{
            activeSession,
            openLiveSessionModal,
            openCurrentSessionModal,
          }}
        />

        <AppFooter />
      </main>

      <BottomNav />

      <LiveSessionModal
        isOpen={isLiveModalOpen}
        onClose={() => setIsLiveModalOpen(false)}
        activity={liveActivity}
        setActivity={setLiveActivity}
        category={liveCategory}
        setCategory={setLiveCategory}
        onStart={startLiveSession}
      />

      <CurrentSessionModal
        isOpen={isCurrentSessionModalOpen}
        onClose={() => setIsCurrentSessionModalOpen(false)}
        activeSession={activeSession}
        onStop={handleStopSession}
        onStartBreak={handleStartBreak}
        onResume={handleResumeSession}
      />

      {activeSession && (
        <BreakReminderPopup
          isOpen={isBreakReminderOpen}
          activity={activeSession.activity}
          onStartBreak={handleStartBreak}
          onSkip={handleSkipBreak}
        />
      )}

      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
}

export default Layout;
