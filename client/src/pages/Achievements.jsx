import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

function Achievements() {
  const navigate = useNavigate();

  const [showForm, setShowForm] = useState(false);
  const [achievements, setAchievements] = useState([]);
  const [editingAchievement, setEditingAchievement] = useState(null);

  const [title, setTitle] = useState("");
  const [organization, setOrganization] = useState("");
  const [year, setYear] = useState("");
  const [description, setDescription] = useState("");

  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAchievements();
  }, []);

  async function loadAchievements() {
    try {
      const response = await API.get("/achievements");
      setAchievements(response.data);
    } catch (error) {
      console.log("Error loading achievements:", error);
      setMessage("Failed to load achievements");
    }
  }

  function validateAchievement() {
    const newErrors = {};

    const cleanTitle = title.trim();
    const cleanOrganization = organization.trim();
    const cleanYear = year.trim();
    const cleanDescription = description.trim();

    if (!cleanTitle) {
      newErrors.title = "Achievement title is required.";
    } else if (cleanTitle.length < 3) {
      newErrors.title =
        "Achievement title must be at least 3 characters.";
    } else if (cleanTitle.length > 100) {
      newErrors.title =
        "Achievement title must be 100 characters or less.";
    }

    if (!cleanOrganization) {
      newErrors.organization = "Organization is required.";
    } else if (cleanOrganization.length < 2) {
      newErrors.organization =
        "Organization must be at least 2 characters.";
    } else if (cleanOrganization.length > 80) {
      newErrors.organization =
        "Organization must be 80 characters or less.";
    }

    if (!cleanYear) {
      newErrors.year = "Year is required.";
    } else if (!/^\d{4}$/.test(cleanYear)) {
      newErrors.year = "Enter a valid 4-digit year.";
    } else {
      const numericYear = Number(cleanYear);
      const currentYear = new Date().getFullYear();

      if (numericYear < 1900 || numericYear > currentYear + 1) {
        newErrors.year =
          `Year must be between 1900 and ${currentYear + 1}.`;
      }
    }

    if (cleanDescription.length > 1000) {
      newErrors.description =
        "Description must be 1000 characters or less.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  function clearFieldError(field) {
    setErrors((previous) => ({
      ...previous,
      [field]: "",
    }));
  }

  function resetForm() {
    setEditingAchievement(null);
    setTitle("");
    setOrganization("");
    setYear("");
    setDescription("");
    setErrors({});
    setShowForm(false);
  }

  const handleSave = async (e) => {
    e.preventDefault();

    setMessage("");

    const valid = validateAchievement();

    if (!valid) {
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem("token");

      const achievementData = {
        title: title.trim(),
        organization: organization.trim(),
        year: year.trim(),
        description: description.trim(),
      };

      if (editingAchievement) {
        await API.put(
          `/achievements/${editingAchievement._id}`,
          achievementData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setMessage("Achievement updated successfully!");
      } else {
        await API.post(
          "/achievements",
          achievementData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setMessage("Achievement saved successfully!");
      }

      resetForm();

      await loadAchievements();
    } catch (error) {
      console.log("Error saving achievement:", error);

      setMessage(
        error.response?.data?.message ||
          "Failed to save achievement"
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteAchievement = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this achievement?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await API.delete(`/achievements/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAchievements(
        achievements.filter(
          (achievement) => achievement._id !== id
        )
      );

      setMessage("Achievement deleted successfully!");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Failed to delete achievement"
      );
    }
  };

  const startEditing = (achievement) => {
    setEditingAchievement(achievement);
    setTitle(achievement.title || "");
    setOrganization(achievement.organization || "");
    setYear(
      achievement.year !== undefined &&
        achievement.year !== null
        ? String(achievement.year)
        : ""
    );
    setDescription(achievement.description || "");
    setErrors({});
    setMessage("");
    setShowForm(true);
  };

  return (
    <div className="skills-page">

      <div className="skills-header">

        <div>
          <h1>Achievements</h1>
          <p>
            Manage your achievements and certifications.
          </p>
        </div>

        <div className="skills-header-actions">

          <button
            className="back-dashboard-button"
            onClick={() => navigate("/dashboard")}
          >
            ← Dashboard
          </button>

          <button
            className="add-skill-button"
            onClick={() => {
              resetForm();
              setShowForm(true);
              setMessage("");
            }}
          >
            + Add Achievement
          </button>

        </div>

      </div>

      {message && <p>{message}</p>}

      {showForm && (
        <div className="skill-form-card">

          <h2>
            {editingAchievement
              ? "Edit Achievement"
              : "Add New Achievement"}
          </h2>

          <form onSubmit={handleSave} noValidate>

            {/* TITLE */}
            <div className="form-group">

              <label htmlFor="achievement-title">
                Title
              </label>

              <input
                id="achievement-title"
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  clearFieldError("title");
                }}
                placeholder="e.g. Full Stack Development Certificate"
                maxLength="100"
                className={
                  errors.title ? "input-error" : ""
                }
              />

              {errors.title && (
                <span className="field-error">
                  {errors.title}
                </span>
              )}

            </div>

            {/* ORGANIZATION */}
            <div className="form-group">

              <label htmlFor="achievement-organization">
                Organization
              </label>

              <input
                id="achievement-organization"
                type="text"
                value={organization}
                onChange={(e) => {
                  setOrganization(e.target.value);
                  clearFieldError("organization");
                }}
                placeholder="e.g. AWS, Coursera, Google"
                maxLength="80"
                className={
                  errors.organization ? "input-error" : ""
                }
              />

              {errors.organization && (
                <span className="field-error">
                  {errors.organization}
                </span>
              )}

            </div>

            {/* YEAR */}
            <div className="form-group">

              <label htmlFor="achievement-year">
                Year
              </label>

              <input
                id="achievement-year"
                type="text"
                inputMode="numeric"
                value={year}
                onChange={(e) => {
                  const value = e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 4);

                  setYear(value);
                  clearFieldError("year");
                }}
                placeholder="2026"
                maxLength="4"
                className={
                  errors.year ? "input-error" : ""
                }
              />

              {errors.year && (
                <span className="field-error">
                  {errors.year}
                </span>
              )}

            </div>

            {/* DESCRIPTION */}
            <div className="form-group">

              <label htmlFor="achievement-description">
                Description
              </label>

              <textarea
                id="achievement-description"
                rows="4"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  clearFieldError("description");
                }}
                placeholder="Describe your achievement..."
                maxLength="1000"
                className={
                  errors.description ? "input-error" : ""
                }
              ></textarea>

              <div className="achievement-field-meta">

                <span>
                  {errors.description ? (
                    <span className="field-error">
                      {errors.description}
                    </span>
                  ) : (
                    "Description is optional"
                  )}
                </span>

                <span>
                  {description.length}/1000
                </span>

              </div>

            </div>

            {/* ACTIONS */}
            <div className="skill-form-actions">

              <button
                type="submit"
                className="add-skill-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingAchievement
                  ? "Update Achievement"
                  : "Save Achievement"}
              </button>

              <button
                type="button"
                className="cancel-skill-button"
                onClick={resetForm}
                disabled={saving}
              >
                Cancel
              </button>

            </div>

          </form>

        </div>
      )}

      {/* ACHIEVEMENTS LIST */}
      {achievements.length > 0 && (
        <div className="skills-grid">

          {achievements.map((achievement) => (
            <div
              className="skill-card"
              key={achievement._id}
            >

              <div className="skill-card-header">

                <div>
                  <h2>{achievement.title}</h2>

                  <p>
                    {achievement.organization}
                  </p>
                </div>

                <span>
                  {achievement.year}
                </span>

              </div>

              {achievement.description && (
                <p>
                  {achievement.description}
                </p>
              )}

              <div className="skill-actions">

                <button
                  className="edit-skill-button"
                  onClick={() =>
                    startEditing(achievement)
                  }
                >
                  Edit
                </button>

                <button
                  className="delete-skill-button"
                  onClick={() =>
                    deleteAchievement(
                      achievement._id
                    )
                  }
                >
                  Delete
                </button>

              </div>

            </div>
          ))}

        </div>
      )}

      {/* EMPTY STATE */}
      {achievements.length === 0 &&
        !showForm &&
        !message && (
          <div className="skills-empty">

            <h2>No achievements yet</h2>

            <p>
              Add your first achievement or certification
              to get started.
            </p>

          </div>
        )}

    </div>
  );
}

export default Achievements;