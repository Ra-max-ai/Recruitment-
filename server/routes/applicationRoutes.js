const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { protect } = require("../middleware/auth");
const {
  applyToJob,
  getMyApplications,
  checkJobApplicationStatus,
  getJobApplications,
  getScheduledInterviews,
  getApplicationById,
  updateApplicationStatus,
  scheduleInterview,
} = require("../controllers/applicationController");

// Public candidate application submission with resume file upload & AI screening
router.post("/apply", upload.single("resume"), applyToJob);

// Candidate portal: View my applications
router.get("/my-applications", protect, getMyApplications);

// Candidate portal: Check status for a specific job
router.get("/check-status/:jobId", protect, checkJobApplicationStatus);

// Recruiter portal: View all scheduled interviews across jobs
router.get("/interviews", protect, getScheduledInterviews);

// Recruiter portal: View all candidates for a specific job (Ranked)
router.get("/job/:jobId", protect, getJobApplications);

// Recruiter portal: View single candidate application
router.get("/:id", protect, getApplicationById);

// Recruiter portal: Update candidate status (Under Review, Shortlisted, etc.)
router.patch("/:id/status", protect, updateApplicationStatus);

// Recruiter portal: Schedule interview
router.post("/:id/interview", protect, scheduleInterview);

module.exports = router;