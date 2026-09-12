const express = require("express");
const mongoose = require("mongoose");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const isValidHttpUrl = (value) => {
  if (!value) {
    return true;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const validateProject = (body) => {
  const title =
    typeof body.title === "string" ? body.title.trim() : "";

  const description =
    typeof body.description === "string"
      ? body.description.trim()
      : "";

  const technologies = Array.isArray(body.technologies)
    ? body.technologies
        .filter((item) => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  const githubLink =
    typeof body.githubLink === "string"
      ? body.githubLink.trim()
      : "";

  const liveLink =
    typeof body.liveLink === "string"
      ? body.liveLink.trim()
      : "";

  const image =
    typeof body.image === "string"
      ? body.image.trim()
      : "";

  const featured =
    typeof body.featured === "boolean"
      ? body.featured
      : false;

  if (!title) {
    return "Project title is required";
  }

  if (title.length < 3) {
    return "Project title must be at least 3 characters";
  }

  if (title.length > 100) {
    return "Project title must not exceed 100 characters";
  }

  if (!description) {
    return "Project description is required";
  }

  if (description.length < 10) {
    return "Project description must be at least 10 characters";
  }

  if (description.length > 1000) {
    return "Project description must not exceed 1000 characters";
  }

  if (technologies.length === 0) {
    return "At least one technology is required";
  }

  if (technologies.length > 20) {
    return "Too many technologies provided";
  }

  for (const technology of technologies) {
    if (technology.length > 50) {
      return "Technology names must not exceed 50 characters";
    }
  }

  if (!isValidHttpUrl(githubLink)) {
    return "GitHub URL must be a valid HTTP or HTTPS URL";
  }

  if (!isValidHttpUrl(liveLink)) {
    return "Live demo URL must be a valid HTTP or HTTPS URL";
  }

  if (!isValidHttpUrl(image)) {
    return "Image URL must be a valid HTTP or HTTPS URL";
  }

  return null;
};

const getProjectData = (body) => {
  return {
    title:
      typeof body.title === "string"
        ? body.title.trim()
        : "",

    description:
      typeof body.description === "string"
        ? body.description.trim()
        : "",

    technologies: Array.isArray(body.technologies)
      ? body.technologies
          .filter((item) => typeof item === "string")
          .map((item) => item.trim())
          .filter(Boolean)
      : [],

    githubLink:
      typeof body.githubLink === "string"
        ? body.githubLink.trim()
        : "",

    liveLink:
      typeof body.liveLink === "string"
        ? body.liveLink.trim()
        : "",

    image:
      typeof body.image === "string"
        ? body.image.trim()
        : "",

    featured:
      typeof body.featured === "boolean"
        ? body.featured
        : false,
  };
};

// GET all projects
router.get("/", async (req, res) => {
  try {
    const projects = await mongoose.connection
      .collection("projects")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.json(projects);
  } catch (error) {
    console.error("Error loading projects:", error.message);

    res.status(500).json({
      message: "Failed to load projects",
    });
  }
});

// GET single project
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid project ID",
      });
    }

    const project = await mongoose.connection
      .collection("projects")
      .findOne({
        _id: new mongoose.Types.ObjectId(id),
      });

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    res.json(project);
  } catch (error) {
    console.error("Error loading project:", error.message);

    res.status(500).json({
      message: "Failed to load project",
    });
  }
});

// CREATE project
router.post("/", protect, async (req, res) => {
  try {
    const validationError = validateProject(req.body);

    if (validationError) {
      return res.status(400).json({
        message: validationError,
      });
    }

    const projectData = getProjectData(req.body);

    const project = {
      ...projectData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await mongoose.connection
      .collection("projects")
      .insertOne(project);

    res.status(201).json({
      _id: result.insertedId,
      ...project,
    });
  } catch (error) {
    console.error("Error creating project:", error.message);

    res.status(400).json({
      message: "Failed to create project",
    });
  }
});

// UPDATE project
router.put("/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid project ID",
      });
    }

    const validationError = validateProject(req.body);

    if (validationError) {
      return res.status(400).json({
        message: validationError,
      });
    }

    const projectData = getProjectData(req.body);

    const result = await mongoose.connection
      .collection("projects")
      .findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(id),
        },
        {
          $set: {
            ...projectData,
            updatedAt: new Date(),
          },
        },
        {
          returnDocument: "after",
        }
      );

    if (!result) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    res.json(result);
  } catch (error) {
    console.error("Error updating project:", error.message);

    res.status(500).json({
      message: "Failed to update project",
    });
  }
});

// DELETE project
router.delete("/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid project ID",
      });
    }

    const result = await mongoose.connection
      .collection("projects")
      .deleteOne({
        _id: new mongoose.Types.ObjectId(id),
      });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    res.json({
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting project:", error.message);

    res.status(500).json({
      message: "Failed to delete project",
    });
  }
});

module.exports = router;