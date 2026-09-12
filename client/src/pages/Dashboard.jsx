import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  User,
  FolderKanban,
  Wrench,
  Trophy,
  FileText,
  MessageSquare,
  Palette,
  LogOut,
  ArrowUpRight,
} from "lucide-react";

import API from "../api/api";

function Dashboard() {
  const navigate = useNavigate();

  const [skillCount, setSkillCount] = useState(0);
  const [projectCount, setProjectCount] = useState(0);
  const [postCount, setPostCount] = useState(0);
  const [achievementCount, setAchievementCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    async function loadSkillCount() {
      try {
        const response = await API.get("/skills");
        setSkillCount(response.data.length);
      } catch (error) {
        console.log("Error loading skill count:", error);
      }
    }

    async function loadProjectCount() {
      try {
        const response = await API.get("/projects");
        setProjectCount(response.data.length);
      } catch (error) {
        console.log("Error loading project count:", error);
      }
    }

    async function loadPostCount() {
      try {
        const response = await API.get("/posts");
        setPostCount(response.data.length);
      } catch (error) {
        console.log("Error loading post count:", error);
      }
    }

    async function loadAchievementCount() {
      try {
        const response = await API.get("/achievements");
        setAchievementCount(response.data.length);
      } catch (error) {
        console.log("Error loading achievement count:", error);
      }
    }

    async function loadMessageCount() {
      try {
        const token = localStorage.getItem("token");

        const response = await API.get("/messages", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setMessageCount(response.data.length);
      } catch (error) {
        console.log("Error loading message count:", error);
      }
    }

    loadSkillCount();
    loadProjectCount();
    loadPostCount();
    loadAchievementCount();
    loadMessageCount();
  }, []);

  const handleLogout = () => {
    const confirmLogout = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmLogout) {
      return;
    }

    setLoggingOut(true);

    localStorage.removeItem("token");

    navigate("/");
  };

  const handleStatKeyDown = (event, path) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      navigate(path);
    }
  };

  return (
    <div className="dashboard">

      {/* =========================
          SIDEBAR
      ========================= */}
      <aside className="sidebar">

        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <LayoutDashboard size={18} />
          </div>

          <div>
            <h2>Portfolio CMS</h2>
            <span>Admin Panel</span>
          </div>
        </div>

        <div className="sidebar-section-label">
          MANAGEMENT
        </div>

        <nav>

          <div
            className="nav-item active"
            onClick={() => navigate("/dashboard")}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </div>

          <div
            className="nav-item"
            onClick={() => navigate("/profile")}
          >
            <User size={18} />
            <span>Profile</span>
          </div>

          <div
            className="nav-item"
            onClick={() => navigate("/skills")}
          >
            <Wrench size={18} />
            <span>Skills</span>
          </div>

          <div
            className="nav-item"
            onClick={() => navigate("/projects")}
          >
            <FolderKanban size={18} />
            <span>Projects</span>
          </div>

          <div
            className="nav-item"
            onClick={() => navigate("/achievements")}
          >
            <Trophy size={18} />
            <span>Achievements</span>
          </div>

          <div
            className="nav-item"
            onClick={() => navigate("/blog-posts")}
          >
            <FileText size={18} />
            <span>Blog Posts</span>
          </div>

          <div
            className="nav-item"
            onClick={() => navigate("/messages")}
          >
            <MessageSquare size={18} />
            <span>Messages</span>

            {messageCount > 0 && (
              <span className="sidebar-badge">
                {messageCount}
              </span>
            )}
          </div>

          <div
            className="nav-item"
            onClick={() => navigate("/contact")}
          >
            <span className="sidebar-contact-icon">✉</span>
            <span>Contact</span>
          </div>

        </nav>

        <div className="sidebar-footer">

          <div
            className={`nav-item logout-item ${
              loggingOut ? "logging-out" : ""
            }`}
            onClick={loggingOut ? undefined : handleLogout}
          >
            <LogOut size={18} />
            <span>
              {loggingOut ? "Logging out..." : "Logout"}
            </span>
          </div>

        </div>

      </aside>

      {/* =========================
          MAIN CONTENT
      ========================= */}
      <main className="dashboard-content">

        {/* Header */}
        <div className="dashboard-header">

          <div className="dashboard-heading">
            <span className="dashboard-eyebrow">
              ADMIN OVERVIEW
            </span>

            <h1>Dashboard</h1>

            <p>
              Manage your portfolio content and monitor your website.
            </p>
          </div>

          <div className="admin-profile">
            <div className="admin-avatar">
              A
            </div>

            <div className="admin-info">
              <strong>Admin</strong>
              <span>Administrator</span>
            </div>
          </div>

        </div>

        {/* =========================
            STATISTICS
        ========================= */}
        <section className="dashboard-section">

          <div className="dashboard-section-heading">
            <div>
              <span className="dashboard-section-label">
                CONTENT
              </span>

              <h2>Portfolio Overview</h2>
            </div>
          </div>

          <div className="stats-container">

            {/* Projects */}
            <div
              className="stat-card stat-projects stat-card-clickable"
              role="button"
              tabIndex={0}
              onClick={() => navigate("/projects")}
              onKeyDown={(event) =>
                handleStatKeyDown(event, "/projects")
              }
            >
              <div className="stat-card-top">
                <div className="stat-icon">
                  <FolderKanban size={21} />
                </div>

                <ArrowUpRight size={17} />
              </div>

              <h3>Total Projects</h3>

              <strong>{projectCount}</strong>

              <span className="stat-description">
                Portfolio projects
              </span>
            </div>

            {/* Skills */}
            <div
              className="stat-card stat-skills stat-card-clickable"
              role="button"
              tabIndex={0}
              onClick={() => navigate("/skills")}
              onKeyDown={(event) =>
                handleStatKeyDown(event, "/skills")
              }
            >
              <div className="stat-card-top">
                <div className="stat-icon">
                  <Wrench size={21} />
                </div>

                <ArrowUpRight size={17} />
              </div>

              <h3>Total Skills</h3>

              <strong>{skillCount}</strong>

              <span className="stat-description">
                Technical skills
              </span>
            </div>

            {/* Blog */}
            <div
              className="stat-card stat-posts stat-card-clickable"
              role="button"
              tabIndex={0}
              onClick={() => navigate("/blog-posts")}
              onKeyDown={(event) =>
                handleStatKeyDown(event, "/blog-posts")
              }
            >
              <div className="stat-card-top">
                <div className="stat-icon">
                  <FileText size={21} />
                </div>

                <ArrowUpRight size={17} />
              </div>

              <h3>Total Blog Posts</h3>

              <strong>{postCount}</strong>

              <span className="stat-description">
                Published content
              </span>
            </div>

            {/* Achievements */}
            <div
              className="stat-card stat-achievements stat-card-clickable"
              role="button"
              tabIndex={0}
              onClick={() => navigate("/achievements")}
              onKeyDown={(event) =>
                handleStatKeyDown(event, "/achievements")
              }
            >
              <div className="stat-card-top">
                <div className="stat-icon">
                  <Trophy size={21} />
                </div>

                <ArrowUpRight size={17} />
              </div>

              <h3>Achievements</h3>

              <strong>{achievementCount}</strong>

              <span className="stat-description">
                Career milestones
              </span>
            </div>

            {/* Messages */}
            <div
              className="stat-card stat-messages stat-card-clickable"
              role="button"
              tabIndex={0}
              onClick={() => navigate("/messages")}
              onKeyDown={(event) =>
                handleStatKeyDown(event, "/messages")
              }
            >
              <div className="stat-card-top">
                <div className="stat-icon">
                  <MessageSquare size={21} />
                </div>

                <ArrowUpRight size={17} />
              </div>

              <h3>Messages</h3>

              <strong>{messageCount}</strong>

              <span className="stat-description">
                Contact enquiries
              </span>
            </div>

          </div>

        </section>

        {/* =========================
            QUICK ACTIONS
        ========================= */}
        <section className="quick-actions">

          <div className="dashboard-section-heading">
            <div>
              <span className="dashboard-section-label">
                SHORTCUTS
              </span>

              <h2>Quick Actions</h2>
            </div>
          </div>

          <div className="action-grid">

            {/* Edit Profile */}
            <button
              type="button"
              className="action-card"
              onClick={() => navigate("/profile")}
            >
              <div className="action-card-icon">
                <User size={21} />
              </div>

              <div className="action-card-content">
                <strong>Edit Profile</strong>
                <span>
                  Update your personal information
                </span>
              </div>

              <ArrowUpRight
                size={17}
                className="action-card-arrow"
              />
            </button>

            {/* Manage Projects */}
            <button
              type="button"
              className="action-card"
              onClick={() => navigate("/projects")}
            >
              <div className="action-card-icon">
                <FolderKanban size={21} />
              </div>

              <div className="action-card-content">
                <strong>Manage Projects</strong>
                <span>
                  Add, edit or delete projects
                </span>
              </div>

              <ArrowUpRight
                size={17}
                className="action-card-arrow"
              />
            </button>

            {/* Write Blog */}
            <button
              type="button"
              className="action-card"
              onClick={() => navigate("/blog-posts")}
            >
              <div className="action-card-icon">
                <FileText size={21} />
              </div>

              <div className="action-card-content">
                <strong>Write Blog</strong>
                <span>
                  Create a new blog post
                </span>
              </div>

              <ArrowUpRight
                size={17}
                className="action-card-arrow"
              />
            </button>

            {/* View Messages */}
            <button
              type="button"
              className="action-card"
              onClick={() => navigate("/messages")}
            >
              <div className="action-card-icon">
                <MessageSquare size={21} />
              </div>

              <div className="action-card-content">
                <strong>View Messages</strong>
                <span>
                  Read your contact enquiries
                </span>
              </div>

              <ArrowUpRight
                size={17}
                className="action-card-arrow"
              />
            </button>

            {/* Theme Settings */}
            <button
              type="button"
              className="action-card"
              onClick={() => navigate("/theme-settings")}
            >
              <div className="action-card-icon">
                <Palette size={21} />
              </div>

              <div className="action-card-content">
                <strong>Theme Settings</strong>
                <span>
                  Customize colors and style
                </span>
              </div>

              <ArrowUpRight
                size={17}
                className="action-card-arrow"
              />
            </button>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Dashboard;