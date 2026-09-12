const express = require("express");
const mongoose = require("mongoose");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Get all achievements
router.get("/", async (req, res) => {
  try {
    const achievements = await mongoose.connection
      .collection("achievements")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.json(achievements);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Get single achievement
router.get("/:id", async (req, res) => {
  try {
    const achievement = await mongoose.connection
      .collection("achievements")
      .findOne({
        _id: new mongoose.Types.ObjectId(req.params.id),
      });

    if (!achievement) {
      return res.status(404).json({
        message: "Achievement not found",
      });
    }

    res.json(achievement);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Add achievement
router.post("/", protect, async (req, res) => {
  try {
    const achievement = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await mongoose.connection
      .collection("achievements")
      .insertOne(achievement);

    res.status(201).json({
      _id: result.insertedId,
      ...achievement,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

// Update achievement
router.put("/:id", protect, async (req, res) => {
  try {
    const result = await mongoose.connection
      .collection("achievements")
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
        message: "Achievement not found",
      });
    }

    res.json(result);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

// Delete achievement
router.delete("/:id", protect, async (req, res) => {
  try {
    const result = await mongoose.connection
      .collection("achievements")
      .deleteOne({
        _id: new mongoose.Types.ObjectId(req.params.id),
      });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "Achievement not found",
      });
    }

    res.json({
      message: "Achievement deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;