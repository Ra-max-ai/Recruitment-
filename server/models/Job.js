const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
    },
    requiredSkills: {
      type: [String],
      required: [true, "At least one required skill must be specified"],
    },
    experienceRequired: {
      type: Number,
      required: [true, "Years of experience required must be provided"],
      min: [0, "Experience cannot be negative"],
      default: 0,
    },
    educationRequired: {
      type: String,
      default: "Bachelor's Degree in Computer Science or related field",
    },
    location: {
      type: String,
      default: "Remote",
    },
    jobType: {
      type: String,
      enum: ["Full-time", "Part-time", "Internship", "Contract"],
      default: "Full-time",
    },
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["Active", "Closed"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Job", jobSchema);
