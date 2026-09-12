const express = require("express");
const mongoose = require("mongoose");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Get all skills
router.get("/", async (req, res) => {
  try {
    const skills = await mongoose.connection
      .collection("skills")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.json(skills);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Add skill
router.post("/", protect, async (req, res) => {
  try {
    const { name, category, level } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Skill name is required",
      });
    }

    const skill = {
      name,
      category: category || "",
      level: level || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await mongoose.connection
      .collection("skills")
      .insertOne(skill);

    res.status(201).json({
      _id: result.insertedId,
      ...skill,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

// Update skill
router.put("/:id", protect, async (req, res) => {
  try {
    const result = await mongoose.connection
      .collection("skills")
      .findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(req.params.id),
        },
        {
          $set: {
            ...req.body,
            updatedAt: new Date(),
          },
        },
        {
          returnDocument: "after",
        }
      );

    if (!result) {
      return res.status(404).json({
        message: "Skill not found",
      });
    }

    res.json(result);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

// Delete skill
router.delete("/:id", protect, async (req, res) => {
  try {
    const result = await mongoose.connection
      .collection("skills")
      .deleteOne({
        _id: new mongoose.Types.ObjectId(req.params.id),
      });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "Skill not found",
      });
    }

    res.json({
      message: "Skill deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;