import { useContext, useState } from "react";
import AppHeader from "../components/AppHeader";
import GreetingCard from "../components/GreetingCard";
import ActivityGrid from "../components/ActivityGrid";
import RecentActivity from "../components/RecentActivity";
import ActivityModal from "../components/ActivityModal";
import { ActivityContext } from "../context/ActivityContext";

function Home() {
  const { activities } = useContext(ActivityContext);
  const [selectedCategory, setSelectedCategory] = useState(null);

  function openCategory(category) {
    setSelectedCategory(category);
  }

  function closeModal() {
    setSelectedCategory(null);
  }

  const modalActivities =
    selectedCategory === "All"
      ? activities
      : activities.filter((item) => item.category === selectedCategory);

  return (
    <div className="home-page">
      <AppHeader />

      <GreetingCard />

      <ActivityGrid onCategoryClick={openCategory} />

      <RecentActivity />

      <ActivityModal
        isOpen={selectedCategory !== null}
        onClose={closeModal}
        title={selectedCategory === "All" ? "All Activities" : selectedCategory}
        activities={modalActivities}
      />
    </div>
  );
}

export default Home;
