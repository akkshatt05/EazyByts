import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

function Projects() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [liveLink, setLiveLink] = useState("");
  const [image, setImage] = useState("");
  const [featured, setFeatured] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      const response = await API.get("/projects");
      setProjects(response.data);
    } catch (err) {
      console.log("Error loading projects:", err);
      setMessage("Failed to load projects");
    }
  }

  function isValidUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }

  function validateProject() {
    const newErrors = {};

    const cleanTitle = title.trim();
    const cleanDescription = description.trim();
    const cleanTechnologies = technologies.trim();
    const cleanGithubLink = githubLink.trim();
    const cleanLiveLink = liveLink.trim();
    const cleanImage = image.trim();

    if (!cleanTitle) {
      newErrors.title = "Project title is required.";
    } else if (cleanTitle.length < 3) {
      newErrors.title = "Project title must be at least 3 characters.";
    } else if (cleanTitle.length > 100) {
      newErrors.title = "Project title must be 100 characters or less.";
    }

    if (!cleanDescription) {
      newErrors.description = "Project description is required.";
    } else if (cleanDescription.length < 10) {
      newErrors.description =
        "Project description must be at least 10 characters.";
    } else if (cleanDescription.length > 1000) {
      newErrors.description =
        "Project description must be 1000 characters or less.";
    }

    if (!cleanTechnologies) {
      newErrors.technologies =
        "Add at least one technology.";
    }

    if (cleanGithubLink && !isValidUrl(cleanGithubLink)) {
      newErrors.githubLink =
        "Please enter a valid GitHub URL.";
    }

    if (cleanLiveLink && !isValidUrl(cleanLiveLink)) {
      newErrors.liveLink =
        "Please enter a valid Live Demo URL.";
    }

    if (cleanImage && !isValidUrl(cleanImage)) {
      newErrors.image =
        "Please enter a valid image URL.";
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
    setTitle("");
    setDescription("");
    setTechnologies("");
    setGithubLink("");
    setLiveLink("");
    setImage("");
    setFeatured(false);
    setEditingProject(null);
    setShowForm(false);
    setErrors({});
  }

  async function saveProject(event) {
    event.preventDefault();

    setMessage("");

    const valid = validateProject();

    if (!valid) {
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem("token");

      const projectData = {
        title: title.trim(),
        description: description.trim(),
        technologies: technologies
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item !== ""),
        githubLink: githubLink.trim(),
        liveLink: liveLink.trim(),
        image: image.trim(),
        featured,
      };

      if (editingProject) {
        await API.put(
          "/projects/" + editingProject._id,
          projectData,
          {
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );

        setMessage("Project updated successfully!");
      } else {
        await API.post("/projects", projectData, {
          headers: {
            Authorization: "Bearer " + token,
          },
        });

        setMessage("Project saved successfully!");
      }

      resetForm();
      loadProjects();
    } catch (err) {
      console.log("Error saving project:", err);

      if (err.response && err.response.data) {
        setMessage(
          err.response.data.message ||
            "Failed to save project"
        );
      } else {
        setMessage("Failed to save project");
      }
    } finally {
      setSaving(false);
    }
  }

  function editProject(project) {
    setEditingProject(project);

    setTitle(project.title || "");
    setDescription(project.description || "");

    setTechnologies(
      Array.isArray(project.technologies)
        ? project.technologies.join(", ")
        : project.technologies || ""
    );

    setGithubLink(project.githubLink || "");
    setLiveLink(project.liveLink || "");
    setImage(project.image || "");
    setFeatured(project.featured || false);

    setErrors({});
    setMessage("");
    setShowForm(true);
  }

  async function deleteProject(projectId) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await API.delete("/projects/" + projectId, {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      setMessage("Project deleted successfully!");

      loadProjects();
    } catch (err) {
      console.log("Error deleting project:", err);

      if (err.response && err.response.data) {
        setMessage(
          err.response.data.message ||
            "Failed to delete project"
        );
      } else {
        setMessage("Failed to delete project");
      }
    }
  }

  return (
    <div className="projects-page">

      <div className="projects-header">

        <div>
          <h1>Projects</h1>
          <p>Manage your portfolio projects.</p>
        </div>

        <div className="projects-header-actions">

          <button
            className="back-dashboard-button"
            onClick={() => navigate("/dashboard")}
          >
            ← Dashboard
          </button>

          <button
            className="add-project-button"
            onClick={() => {
              setShowForm(true);
              setEditingProject(null);
              setErrors({});
              setMessage("");
            }}
          >
            + Add Project
          </button>

        </div>

      </div>

      {message && (
        <p className="project-message">
          {message}
        </p>
      )}

      {showForm && (
        <div className="project-form-card">

          <h2>
            {editingProject
              ? "Edit Project"
              : "Add New Project"}
          </h2>

          <form onSubmit={saveProject} noValidate>

            {/* TITLE */}
            <div className="form-group">

              <label htmlFor="project-title">
                Project Title
              </label>

              <input
                id="project-title"
                type="text"
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                  clearFieldError("title");
                }}
                placeholder="Enter project title"
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

            {/* DESCRIPTION */}
            <div className="form-group">

              <label htmlFor="project-description">
                Description
              </label>

              <textarea
                id="project-description"
                rows="4"
                value={description}
                onChange={(event) => {
                  setDescription(event.target.value);
                  clearFieldError("description");
                }}
                placeholder="Describe your project..."
                maxLength="1000"
                className={
                  errors.description
                    ? "input-error"
                    : ""
                }
              />

              <div className="project-field-meta">
                <span>
                  {errors.description ? (
                    <span className="field-error">
                      {errors.description}
                    </span>
                  ) : (
                    "Minimum 10 characters"
                  )}
                </span>

                <span>
                  {description.length}/1000
                </span>
              </div>

            </div>

            {/* TECHNOLOGIES */}
            <div className="form-group">

              <label htmlFor="project-technologies">
                Technologies
              </label>

              <input
                id="project-technologies"
                type="text"
                value={technologies}
                onChange={(event) => {
                  setTechnologies(event.target.value);
                  clearFieldError("technologies");
                }}
                placeholder="React, Node.js, MongoDB"
                className={
                  errors.technologies
                    ? "input-error"
                    : ""
                }
              />

              {errors.technologies && (
                <span className="field-error">
                  {errors.technologies}
                </span>
              )}

            </div>

            {/* GITHUB */}
            <div className="form-group">

              <label htmlFor="project-github">
                GitHub Link
              </label>

              <input
                id="project-github"
                type="url"
                value={githubLink}
                onChange={(event) => {
                  setGithubLink(event.target.value);
                  clearFieldError("githubLink");
                }}
                placeholder="https://github.com/..."
                className={
                  errors.githubLink
                    ? "input-error"
                    : ""
                }
              />

              {errors.githubLink && (
                <span className="field-error">
                  {errors.githubLink}
                </span>
              )}

            </div>

            {/* LIVE DEMO */}
            <div className="form-group">

              <label htmlFor="project-live">
                Live Demo Link
              </label>

              <input
                id="project-live"
                type="url"
                value={liveLink}
                onChange={(event) => {
                  setLiveLink(event.target.value);
                  clearFieldError("liveLink");
                }}
                placeholder="https://..."
                className={
                  errors.liveLink
                    ? "input-error"
                    : ""
                }
              />

              {errors.liveLink && (
                <span className="field-error">
                  {errors.liveLink}
                </span>
              )}

            </div>

            {/* IMAGE */}
            <div className="form-group">

              <label htmlFor="project-image">
                Project Image URL
              </label>

              <input
                id="project-image"
                type="url"
                value={image}
                onChange={(event) => {
                  setImage(event.target.value);
                  clearFieldError("image");
                }}
                placeholder="https://example.com/project-image.jpg"
                className={
                  errors.image ? "input-error" : ""
                }
              />

              {errors.image && (
                <span className="field-error">
                  {errors.image}
                </span>
              )}

            </div>

            {/* FEATURED */}
            <div className="featured-project-option">

              <label>

                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(event) =>
                    setFeatured(event.target.checked)
                  }
                />

                Featured Project

              </label>

            </div>

            {/* BUTTONS */}
            <div className="project-form-actions">

              <button
                type="submit"
                className="save-project-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingProject
                  ? "Update Project"
                  : "Save Project"}
              </button>

              <button
                type="button"
                className="cancel-project-button"
                onClick={resetForm}
                disabled={saving}
              >
                Cancel
              </button>

            </div>

          </form>

        </div>
      )}

      {/* EMPTY STATE */}
      {!showForm && projects.length === 0 && (
        <div className="projects-empty">

          <h2>No Projects Yet</h2>

          <p>
            Start building your portfolio by adding
            your first project.
          </p>

          <button
            className="add-project-button"
            onClick={() => {
              setShowForm(true);
              setMessage("");
            }}
          >
            + Add Your First Project
          </button>

        </div>
      )}

      {/* PROJECT LIST */}
      {!showForm && projects.length > 0 && (
        <div className="projects-grid">

          {projects.map((project) => (
            <div
              className="project-card"
              key={project._id}
            >

              {project.image && (
                <img
                  src={project.image}
                  alt={project.title}
                  className="project-image"
                />
              )}

              <div className="project-title-row">

                <h2>{project.title}</h2>

                {project.featured && (
                  <span className="featured-badge">
                    Featured
                  </span>
                )}

              </div>

              <p>{project.description}</p>

              {project.technologies &&
                project.technologies.length > 0 && (
                  <div className="technology-list">

                    {project.technologies.map(
                      (technology, index) => (
                        <span key={index}>
                          {technology}
                        </span>
                      )
                    )}

                  </div>
                )}

              <div className="project-links">

                {project.githubLink && (
                  <a
                    href={project.githubLink}
                    target="_blank"
                    rel="noreferrer"
                  >
                    GitHub
                  </a>
                )}

                {project.liveLink && (
                  <a
                    href={project.liveLink}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Live Demo
                  </a>
                )}

                <button
                  className="edit-project-button"
                  onClick={() => editProject(project)}
                >
                  Edit
                </button>

                <button
                  className="delete-project-button"
                  onClick={() =>
                    deleteProject(project._id)
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

export default Projects;