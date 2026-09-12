import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

function Skills() {
  const navigate = useNavigate();

  const [skills, setSkills] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [editingSkill, setEditingSkill] = useState(null);

  useEffect(() => {
    loadSkills();
  }, []);

  async function loadSkills() {
    try {
      const response = await API.get("/skills");
      setSkills(response.data);
    } catch (err) {
      console.log("Error loading skills:", err);
      setMessage("Failed to load skills");
    }
  }

  function validateSkill() {
    const newErrors = {};

    const cleanName = name.trim();
    const cleanCategory = category.trim();
    const numericLevel = Number(level);

    if (!cleanName) {
      newErrors.name = "Skill name is required.";
    } else if (cleanName.length < 2) {
      newErrors.name = "Skill name must be at least 2 characters.";
    } else if (cleanName.length > 50) {
      newErrors.name = "Skill name must be 50 characters or less.";
    }

    if (cleanCategory.length > 50) {
      newErrors.category =
        "Category must be 50 characters or less.";
    }

    if (level === "") {
      newErrors.level = "Skill level is required.";
    } else if (!Number.isFinite(numericLevel)) {
      newErrors.level = "Skill level must be a number.";
    } else if (numericLevel < 0 || numericLevel > 100) {
      newErrors.level = "Skill level must be between 0 and 100.";
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

  async function saveSkill(event) {
    event.preventDefault();

    setMessage("");

    const valid = validateSkill();

    if (!valid) {
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem("token");

      const skillData = {
        name: name.trim(),
        category: category.trim(),
        level: Number(level),
      };

      if (editingSkill) {
        await API.put(
          "/skills/" + editingSkill._id,
          skillData,
          {
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );

        setMessage("Skill updated successfully!");
      } else {
        await API.post("/skills", skillData, {
          headers: {
            Authorization: "Bearer " + token,
          },
        });

        setMessage("Skill saved successfully!");
      }

      setName("");
      setCategory("");
      setLevel("");
      setEditingSkill(null);
      setShowForm(false);
      setErrors({});

      loadSkills();
    } catch (err) {
      console.log("Error saving skill:", err);

      if (err.response && err.response.data) {
        setMessage(
          err.response.data.message || "Failed to save skill"
        );
      } else {
        setMessage("Failed to save skill");
      }
    } finally {
      setSaving(false);
    }
  }

  function editSkill(skill) {
    setEditingSkill(skill);

    setName(skill.name || "");
    setCategory(skill.category || "");
    setLevel(
      skill.level !== undefined && skill.level !== null
        ? String(skill.level)
        : ""
    );

    setErrors({});
    setMessage("");
    setShowForm(true);
  }

  async function deleteSkill(skillId) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this skill?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await API.delete("/skills/" + skillId, {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      setMessage("Skill deleted successfully!");

      loadSkills();
    } catch (err) {
      console.log("Error deleting skill:", err);

      if (err.response && err.response.data) {
        setMessage(
          err.response.data.message || "Failed to delete skill"
        );
      } else {
        setMessage("Failed to delete skill");
      }
    }
  }

  function resetSkillForm() {
    setShowForm(false);
    setEditingSkill(null);
    setName("");
    setCategory("");
    setLevel("");
    setErrors({});
    setMessage("");
  }

  function decreaseLevel() {
    const currentLevel = Number(level) || 0;
    setLevel(String(Math.max(0, currentLevel - 5)));
    clearFieldError("level");
  }

  function increaseLevel() {
    const currentLevel = Number(level) || 0;
    setLevel(String(Math.min(100, currentLevel + 5)));
    clearFieldError("level");
  }

  return (
    <div className="skills-page">

      <div className="skills-header">

        <div>
          <h1>Skills</h1>
          <p>Manage your technical skills.</p>
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
              resetSkillForm();
              setShowForm(true);
            }}
          >
            + Add Skill
          </button>

        </div>

      </div>

      {message && (
        <p>{message}</p>
      )}

      {showForm && (
        <div className="skill-form-card">

          <h2>
            {editingSkill ? "Edit Skill" : "Add New Skill"}
          </h2>

          <form onSubmit={saveSkill} noValidate>

            {/* SKILL NAME */}
            <div className="form-group">

              <label htmlFor="skill-name">
                Skill Name
              </label>

              <input
                id="skill-name"
                type="text"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  clearFieldError("name");
                }}
                placeholder="JavaScript"
                maxLength="50"
                className={errors.name ? "input-error" : ""}
              />

              {errors.name && (
                <span className="field-error">
                  {errors.name}
                </span>
              )}

            </div>

            {/* CATEGORY */}
            <div className="form-group">

              <label htmlFor="skill-category">
                Category
              </label>

              <input
                id="skill-category"
                type="text"
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value);
                  clearFieldError("category");
                }}
                placeholder="Frontend"
                maxLength="50"
                className={
                  errors.category ? "input-error" : ""
                }
              />

              {errors.category && (
                <span className="field-error">
                  {errors.category}
                </span>
              )}

            </div>

            {/* LEVEL */}
            <div className="form-group">

              <label htmlFor="skill-level">
                Skill Level (%)
              </label>

              <div className="skill-level-input">

                <button
                  type="button"
                  onClick={decreaseLevel}
                  disabled={saving}
                >
                  −
                </button>

                <input
                  id="skill-level"
                  type="number"
                  min="0"
                  max="100"
                  value={level}
                  onChange={(event) => {
                    setLevel(event.target.value);
                    clearFieldError("level");
                  }}
                  placeholder="90"
                  className={
                    errors.level ? "input-error" : ""
                  }
                />

                <button
                  type="button"
                  onClick={increaseLevel}
                  disabled={saving}
                >
                  +
                </button>

              </div>

              {errors.level && (
                <span className="field-error">
                  {errors.level}
                </span>
              )}

            </div>

            <div className="skill-form-actions">

              <button
                type="submit"
                className="save-skill-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingSkill
                  ? "Update Skill"
                  : "Save Skill"}
              </button>

              <button
                type="button"
                className="cancel-skill-button"
                onClick={resetSkillForm}
                disabled={saving}
              >
                Cancel
              </button>

            </div>

          </form>

        </div>
      )}

      {!showForm && skills.length === 0 && (
        <div className="skills-empty">

          <h2>No Skills Yet</h2>

          <p>
            Start building your skill set by adding your first skill.
          </p>

          <button
            className="add-skill-button"
            onClick={() => {
              setShowForm(true);
              setMessage("");
            }}
          >
            + Add Your First Skill
          </button>

        </div>
      )}

      {!showForm && skills.length > 0 && (
        <div className="skills-grid">

          {skills.map((skill) => (
            <div
              className="skill-card"
              key={skill._id}
            >

              <div className="skill-card-header">

                <div>

                  <h2>{skill.name}</h2>

                  {skill.category && (
                    <p>{skill.category}</p>
                  )}

                </div>

                <span className="skill-level">
                  {skill.level || 0}%
                </span>

              </div>

              <div className="skill-progress">

                <div
                  className="skill-progress-bar"
                  style={{
                    width: (skill.level || 0) + "%",
                  }}
                ></div>

              </div>

              <div className="skill-actions">

                <button
                  className="edit-skill-button"
                  onClick={() => editSkill(skill)}
                >
                  Edit
                </button>

                <button
                  className="delete-skill-button"
                  onClick={() =>
                    deleteSkill(skill._id)
                  }
                >
                  Delete
                </button>

              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}

export default Skills;