const express = require("express");
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const protect = require("../middleware/authMiddleware");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const router = express.Router();

const getMessagesCollection = () => {
  if (!mongoose.connection.db) {
    throw new Error("MongoDB database connection is not ready");
  }

  return mongoose.connection.db.collection("messages");
};

// GET all messages
router.get("/", protect, async (req, res) => {
  try {
    const messages = await getMessagesCollection()
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    res.json(messages);
  } catch (error) {
    res.status(500).json({
      message: "Error loading messages",
      error: error.message,
    });
  }
});

// POST a new message
router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        message: "Name, email and message are required",
      });
    }

    const newMessage = {
      name,
      email,
      subject: subject || "",
      message,
      read: false,
      createdAt: new Date(),
    };

    // Save message to MongoDB
    const result = await getMessagesCollection().insertOne(newMessage);

    // Send email notification
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: `Portfolio Contact: ${subject || "New Message"}`,
      text: `
Name: ${name}
Email: ${email}

Message:
${message}
      `,
    });

    res.status(201).json({
      message: "Message sent successfully",
      data: {
        _id: result.insertedId,
        ...newMessage,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Mark message as read/unread
router.put("/:id", protect, async (req, res) => {
  try {
    const { read } = req.body;

    const result = await getMessagesCollection().updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { read: Boolean(read) } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    res.json({
      message: "Message updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating message",
      error: error.message,
    });
  }
});

// Delete message
router.delete("/:id", protect, async (req, res) => {
  try {
    const result = await getMessagesCollection().deleteOne({
      _id: new ObjectId(req.params.id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    res.json({
      message: "Message deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting message",
      error: error.message,
    });
  }
});

module.exports = router;