const express = require("express");
const mongoose = require("mongoose");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

const getUsersCollection = () => {
  return mongoose.connection.db.collection("users");
};

/*
  Get the currently logged-in user's ID from JWT.
  Different versions of the auth route may use
  id, _id or userId, so we support all three.
*/
const getUserIdFromRequest = (req) => {
  return (
    req.user?.id ||
    req.user?._id ||
    req.user?.userId ||
    null
  );
};

/* =========================
   GET PUBLIC PROFILE
========================= */

router.get("/", async (req, res) => {
  try {
    const usersCollection = getUsersCollection();

    /*
      The user who last saved the portfolio profile
      becomes the portfolio owner.
    */
    let user = await usersCollection.findOne({
      isPortfolioOwner: true,
    });

    /*
      Fallback for existing database data.
    */
    if (!user) {
      user = await usersCollection.findOne({});
    }

    if (!user) {
      return res.status(404).json({
        message: "Profile not found",
      });
    }

    res.json({
      name: user.name || "",
      email: user.email || "",
      profileRole: user.profileRole || "",
      about: user.about || "",
      profileImage: user.profileImage || "",
    });

  } catch (error) {
    console.log(
      "Error getting profile:",
      error
    );

    res.status(500).json({
      message: "Failed to get profile",
    });
  }
});

/* =========================
   UPDATE PROFILE
========================= */

router.post("/", protect, async (req, res) => {
  try {
    const {
      name,
      email,
      profileRole,
      about,
      profileImage,
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message: "Name and email are required",
      });
    }

    const usersCollection = getUsersCollection();

    const userId = getUserIdFromRequest(req);

    if (!userId) {
      return res.status(401).json({
        message: "User information not found",
      });
    }

    let objectId;

    try {
      objectId = new mongoose.Types.ObjectId(userId);
    } catch (error) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    /*
      Remove portfolio owner status from other users.
      This makes sure only one profile is shown
      on the public portfolio.
    */

    await usersCollection.updateMany(
      {},
      {
        $set: {
          isPortfolioOwner: false,
        },
      }
    );

    /*
      Update the currently logged-in user.
    */

    const result = await usersCollection.updateOne(
      {
        _id: objectId,
      },
      {
        $set: {
          name: name,
          email: email,
          profileRole: profileRole || "",
          about: about || "",
          profileImage: profileImage || "",
          isPortfolioOwner: true,
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      message: "Profile updated successfully",
    });

  } catch (error) {
    console.log(
      "Error updating profile:",
      error
    );

    res.status(500).json({
      message: "Failed to update profile",
    });
  }
});

module.exports = router;