import { NavLink } from "react-router-dom";
import { House, PlusCircle, ChartNoAxesCombined } from "lucide-react";

import "./BottomNav.css";

function BottomNav() {
  return (
    <nav className="bottom-nav">
      <NavLink
        to="/"
        className={({ isActive }) =>
          isActive ? "nav-item active" : "nav-item"
        }
      >
        <House size={22} />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/add"
        className={({ isActive }) =>
          isActive ? "nav-item active" : "nav-item"
        }
      >
        <PlusCircle size={22} />
        <span>Add Activity</span>
      </NavLink>

      <NavLink
        to="/analytics"
        className={({ isActive }) =>
          isActive ? "nav-item active" : "nav-item"
        }
      >
        <ChartNoAxesCombined size={22} />
        <span>Analytics</span>
      </NavLink>
    </nav>
  );
}

export default BottomNav;
