/**
 * Admin Panel - Main Component
 * Central hub for all admin functions
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  Users,
  Settings,
  BarChart3,
  AlertCircle,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { isAdminUser } from "../utils/adminConfig.js";
import AdminUsers from "./AdminUsers.jsx";
import AdminTasks from "./AdminTasks.jsx";
import AdminReports from "./AdminReports.jsx";
import AdminAnalytics from "./AdminAnalytics.jsx";
import AdminSettings from "./AdminSettings.jsx";
import "../styles/adminPanel.css";

export const AdminPanel = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Check if user is admin
  useEffect(() => {
    if (!user || !isAdminUser(user)) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const sections = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: <BarChart3 size={20} />,
      component: AdminAnalytics,
    },
    {
      id: "users",
      name: "Users",
      icon: <Users size={20} />,
      component: AdminUsers,
    },
    {
      id: "tasks",
      name: "Tasks",
      icon: <AlertCircle size={20} />,
      component: AdminTasks,
    },
    {
      id: "reports",
      name: "Reports",
      icon: <AlertCircle size={20} />,
      component: AdminReports,
    },
    {
      id: "settings",
      name: "Settings",
      icon: <Settings size={20} />,
      component: AdminSettings,
    },
  ];

  const ActiveComponent =
    sections.find((s) => s.id === activeSection)?.component || AdminAnalytics;

  return (
    <div className="admin-panel-container">
      {/* Sidebar */}
      <div className={`admin-sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="admin-sidebar-header">
          <h1 className="admin-title">Admin Panel</h1>
          <button
            className="sidebar-toggle-mobile"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="admin-nav">
          {sections.map((section) => (
            <button
              key={section.id}
              className={`nav-item ${activeSection === section.id ? "active" : ""}`}
              onClick={() => {
                setActiveSection(section.id);
                if (window.innerWidth <= 768) {
                  setSidebarOpen(false);
                }
              }}
            >
              {section.icon}
              <span>{section.name}</span>
            </button>
          ))}
        </nav>

        <div className="admin-user-info">
          <div className="user-profile">
            <div className="profile-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="profile-details">
              <p className="profile-name">{user?.name}</p>
              <p className="profile-email">{user?.email}</p>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-main-content">
        <div className="admin-header">
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h2 className="section-title">
            {sections.find((s) => s.id === activeSection)?.name || "Dashboard"}
          </h2>
          <div className="header-spacer"></div>
        </div>

        <div className="admin-content">
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
