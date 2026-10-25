const Job = require("../models/Job");
const Application = require("../models/Application");

const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate("recruiterId", "name email company").sort({ createdAt: -1 });

    const jobsWithCounts = await Promise.all(
      jobs.map(async (job) => {
        const applicantCount = await Application.countDocuments({ jobId: job._id });
        return {
          ...job.toObject(),
          applicantCount,
        };
      })
    );

    res.json(jobsWithCounts);
  } catch (error) {
    console.error("Error in getJobs:", error.message);
    res.status(500).json({ message: error.message });
  }
};

const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate("recruiterId", "name email company");
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    const applicantCount = await Application.countDocuments({ jobId: job._id });
    res.json({
      ...job.toObject(),
      applicantCount,
    });
  } catch (error) {
    console.error("Error in getJobById:", error.message);
    res.status(500).json({ message: error.message });
  }
};

const createJob = async (req, res) => {
  try {
    const {
      title,
      description,
      requiredSkills,
      experienceRequired,
      educationRequired,
      location,
      jobType,
    } = req.body;

    if (!title || !description || !requiredSkills || experienceRequired === undefined) {
      return res.status(400).json({
        message: "Please provide title, description, required skills, and experience",
      });
    }

    let skillsArray = [];
    if (Array.isArray(requiredSkills)) {
      skillsArray = requiredSkills.map((s) => s.trim()).filter((s) => s.length > 0);
    } else if (typeof requiredSkills === "string") {
      skillsArray = requiredSkills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    }

    if (skillsArray.length === 0) {
      return res.status(400).json({ message: "At least one valid skill is required" });
    }

    const job = await Job.create({
      title,
      description,
      requiredSkills: skillsArray,
      experienceRequired: Number(experienceRequired),
      educationRequired: educationRequired || "Bachelor's Degree",
      location: location || "Remote",
      jobType: jobType || "Full-time",
      recruiterId: req.user._id,
    });

    res.status(201).json(job);
  } catch (error) {
    console.error("Error in createJob:", error.message);
    res.status(500).json({ message: error.message });
  }
};

const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.recruiterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this job" });
    }

    await Job.findByIdAndDelete(req.params.id);
    await Application.deleteMany({ jobId: req.params.id });

    res.json({ message: "Job and its applications removed successfully" });
  } catch (error) {
    console.error("Error in deleteJob:", error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getJobs,
  getJobById,
  createJob,
  deleteJob,
};
