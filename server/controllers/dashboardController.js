const Job = require("../models/Job");
const Application = require("../models/Application");

/**
 * @desc    Get dashboard metrics, aggregate stats, and candidate rankings
 * @route   GET /api/dashboard/stats
 * @access  Private (Recruiter)
 */
const getDashboardStats = async (req, res) => {
  try {
    // 1. Calculate Core Metrics
    const totalJobs = await Job.countDocuments();
    const totalCandidates = await Application.countDocuments();
    const underReview = await Application.countDocuments({ status: "Under Review" });
    const shortlisted = await Application.countDocuments({ status: "Shortlisted" });
    const interviewsScheduled = await Application.countDocuments({ status: "Interview Scheduled" });
    const selected = await Application.countDocuments({ status: "Selected" });
    const rejected = await Application.countDocuments({ status: "Rejected" });

    // 2. Fetch Top Ranked Candidates across all jobs
    const topRankedCandidates = await Application.find()
      .populate("jobId", "title location")
      .sort({ "matchResult.matchScore": -1, createdAt: -1 })
      .limit(6);

    // 3. Fetch Upcoming Scheduled Interviews
    const upcomingInterviews = await Application.find({
      "interview.scheduledDate": { $exists: true, $ne: null },
    })
      .populate("jobId", "title")
      .sort({ "interview.scheduledDate": 1 })
      .limit(5);

    // 4. Recent Applications
    const recentApplications = await Application.find()
      .populate("jobId", "title")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      counts: {
        totalJobs,
        totalCandidates,
        underReview,
        shortlisted,
        interviewsScheduled,
        selected,
        rejected,
      },
      topRankedCandidates,
      upcomingInterviews,
      recentApplications,
    });
  } catch (error) {
    console.error("Error in getDashboardStats:", error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
};