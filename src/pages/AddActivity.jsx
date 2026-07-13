import { useOutletContext } from "react-router-dom";
import ActivityForm from "../components/ActivityForm";
import AppHeader from "../components/AppHeader";
import LiveSessionCard from "../components/LiveSessionCard";
import SetGoalsCard from "../components/SetGoalsCard";
import "./AddActivity.css";

function AddActivity() {
  const { activeSession, openLiveSessionModal, openCurrentSessionModal } =
    useOutletContext();

  return (
    <div className="add-activity-page">
      <AppHeader />

      <div className="add-activity-content">
        <LiveSessionCard
          activeSession={activeSession}
          onStart={openLiveSessionModal}
          onViewSession={openCurrentSessionModal}
        />

        <SetGoalsCard />

        <ActivityForm />
      </div>
    </div>
  );
}

export default AddActivity;
