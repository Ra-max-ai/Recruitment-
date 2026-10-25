const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: [true, "Job ID is required"],
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    candidateName: {
      type: String,
      required: [true, "Candidate name is required"],
      trim: true,
    },
    candidateEmail: {
      type: String,
      required: [true, "Candidate email is required"],
      lowercase: true,
      trim: true,
    },
    candidatePhone: {
      type: String,
      required: [true, "Candidate phone number is required"],
      trim: true,
    },
    resumeFileName: {
      type: String,
      required: [true, "Resume file name is required"],
    },
    resumeFilePath: {
      type: String,
      required: [true, "Resume file path is required"],
    },
    rawExtractedText: {
      type: String,
      default: "",
    },

    // Extracted by AI
    extractedData: {
      skills: {
        type: [String],
        default: [],
      },
      education: {
        type: String,
        default: "Not Specified",
      },
      experienceYears: {
        type: Number,
        default: 0,
      },
      summary: {
        type: String,
        default: "",
      },
    },

    // AI Matching Output
    matchResult: {
      matchScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      matchedSkills: {
        type: [String],
        default: [],
      },
      missingSkills: {
        type: [String],
        default: [],
      },
      scoreReasoning: {
        type: String,
        default: "",
      },
    },

    // 6 Application Tracking Statuses
    status: {
      type: String,
      enum: [
        "Applied",
        "Under Review",
        "Shortlisted",
        "Interview Scheduled",
        "Selected",
        "Rejected",
      ],
      default: "Applied",
    },

    // Interview Coordination
    interview: {
      scheduledDate: {
        type: Date,
      },
      scheduledTime: {
        type: String,
      },
      interviewType: {
        type: String,
        enum: ["Online (Google Meet / Zoom)", "In-Person"],
        default: "Online (Google Meet / Zoom)",
      },
      notes: {
        type: String,
        default: "",
      },
      status: {
        type: String,
        enum: ["Pending", "Completed", "Cancelled"],
        default: "Pending",
      },
    },
  },
  {
    timestamps: true,
  }
);

applicationSchema.index({ jobId: 1, "matchResult.matchScore": -1 });
applicationSchema.index({ candidateId: 1 });
applicationSchema.index({ candidateEmail: 1 });

module.exports = mongoose.model("Application", applicationSchema);