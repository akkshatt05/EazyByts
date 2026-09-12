const express = require("express");
const mongoose = require("mongoose");
const protect = require("../middleware/authMiddleware");
const router = express.Router();

// GET all posts
router.get("/", async (req, res) => {
  try {
    const posts = await mongoose.connection
      .collection("posts")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.json(posts);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// GET single post
router.get("/:id", async (req, res) => {
  try {
    const post = await mongoose.connection
      .collection("posts")
      .findOne({
        _id: new mongoose.Types.ObjectId(req.params.id),
      });

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// CREATE post
router.post("/", protect, async (req, res) => {
  try {
    const post = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await mongoose.connection
      .collection("posts")
      .insertOne(post);

    res.status(201).json({
      _id: result.insertedId,
      ...post,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

// UPDATE post
router.put("/:id", protect, async (req, res) => {
  try {
    const result = await mongoose.connection
      .collection("posts")
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
        message: "Post not found",
      });
    }

    res.json(result);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

// DELETE post
router.delete("/:id", protect, async (req, res) => {
  try {
    const result = await mongoose.connection
      .collection("posts")
      .deleteOne({
        _id: new mongoose.Types.ObjectId(req.params.id),
      });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    res.json({
      message: "Post deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;