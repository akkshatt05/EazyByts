const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true,
      trim: true
    },

    technologies: {
      type: [String],
      default: []
    },

    image: {
      type: String,
      default: ""
    },

    githubLink: {
      type: String,
      default: ""
    },

    liveLink: {
      type: String,
      default: ""
    },

    featured: {
      type: Boolean,
      default: false
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Project", projectSchema);