import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ThemeSettings() {
  const navigate = useNavigate();

  const [theme, setTheme] = useState(
    localStorage.getItem("portfolioTheme") || "dark"
  );

  const [accent, setAccent] = useState(
    localStorage.getItem("portfolioAccent") || "blue"
  );

  const handleSave = () => {
    localStorage.setItem("portfolioTheme", theme);
    localStorage.setItem("portfolioAccent", accent);

    document.body.className =
      theme + "-theme " + accent + "-accent";

    alert("Theme settings saved successfully!");
  };

  return (
    <div className="skills-page">

      <div className="skills-header">

        <div>
          <h1>Theme Settings</h1>
          <p>
            Customize your portfolio colors and appearance.
          </p>
        </div>

        <button
          className="back-dashboard-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>

      </div>

      <div className="skill-form-card">

        <h2>Appearance</h2>

        <div className="form-group">

          <label>Theme</label>

          <select
            value={theme}
            onChange={(e) => {
              setTheme(e.target.value);
            }}
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>

        </div>

        <div className="form-group">

          <label>Accent Color</label>

          <select
            value={accent}
            onChange={(e) => {
              setAccent(e.target.value);
            }}
          >
            <option value="blue">Blue</option>
            <option value="purple">Purple</option>
            <option value="green">Green</option>
            <option value="orange">Orange</option>
          </select>

        </div>

        <button
          className="add-skill-button"
          onClick={handleSave}
        >
          Save Theme Settings
        </button>

      </div>

    </div>
  );
}

export default ThemeSettings;