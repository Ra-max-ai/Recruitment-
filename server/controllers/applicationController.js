const Application = require("../models/Application");
const Job = require("../models/Job");
const { extractResumeText } = require("../services/textExtractor");
const { screenResumeWithAI } = require("../services/aiService");
const path = require("path");

/**
 * @desc    Submit job application with resume upload & AI screening
 * @route   POST /api/applications/apply
 * @access  Public (Candidate)
 */
const applyToJob = async (req, res) => {
  try {
    const { jobId, candidateName, candidateEmail, candidatePhone, candidateId } = req.body;

    // Validate required fields
    if (!jobId || !candidateName || !candidateEmail || !candidatePhone) {
      return res.status(400).json({
        message: "Please provide all required fields: jobId, name, email, and phone number.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Please upload your resume file (.pdf or .docx).",
      });
    }

    // Check if the job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job opening not found." });
    }

    // Check if candidate already applied for this job (by email or candidateId)
    const cleanEmail = candidateEmail.toLowerCase().trim();
    const linkedCandidateId = candidateId || (req.user ? req.user._id : null);

    const duplicateCheck = [{ candidateEmail: cleanEmail }];
    if (linkedCandidateId) {
      duplicateCheck.push({ candidateId: linkedCandidateId });
    }

    const existing = await Application.findOne({
      jobId,
      $or: duplicateCheck,
    });

    if (existing) {
      return res.status(400).json({
        message: "You have already submitted an application for this job posting.",
        existingApplicationId: existing._id,
        currentStatus: existing.status,
      });
    }

    // 1. Extract text from the uploaded resume file
    console.log(`📄 Extracting text from uploaded resume: ${req.file.originalname}`);
    let extractedText = "";
    try {
      extractedText = await extractResumeText(req.file.path, req.file.originalname);
    } catch (parseError) {
      console.error("Text extraction failed:", parseError.message);
      return res.status(422).json({
        message: `Failed to process resume: ${parseError.message}`,
      });
    }

    // 2. Perform AI Resume Screening & Matching (Google Gemini LLM / NLP)
    console.log(`🧠 Running AI Candidate Matching against job: "${job.title}"...`);
    let aiEvaluation = {
      extractedData: { skills: [], education: "Not Specified", experienceYears: 0, summary: "" },
      matchResult: { matchScore: 0, matchedSkills: [], missingSkills: job.requiredSkills || [], scoreReasoning: "" },
    };

    try {
      aiEvaluation = await screenResumeWithAI(extractedText, job);
    } catch (aiError) {
      console.error("AI screening error:", aiError.message);
    }

    // 3. Save Application record with AI screening results to MongoDB
    const application = await Application.create({
      jobId,
      candidateId: linkedCandidateId,
      candidateName: candidateName.trim(),
      candidateEmail: cleanEmail,
      candidatePhone: candidatePhone.trim(),
      resumeFileName: req.file.filename,
      resumeFilePath: `/uploads/${req.file.filename}`,
      rawExtractedText: extractedText,
      extractedData: aiEvaluation.extractedData || {},
      matchResult: aiEvaluation.matchResult || {},
      status: "Applied",
    });

    console.log(`✅ Application created for ${candidateName}. AI Score: ${application.matchResult.matchScore}%`);

    res.status(201).json({
      success: true,
      message: "Application submitted and analyzed by AI successfully!",
      application: {
        _id: application._id,
        jobId: application.jobId,
        candidateName: application.candidateName,
        candidateEmail: application.candidateEmail,
        status: application.status,
        resumeFileName: application.resumeFileName,
        resumeFilePath: application.resumeFilePath,
        extractedData: application.extractedData,
        matchResult: application.matchResult,
        extractedTextPreview: extractedText.slice(0, 300) + (extractedText.length > 300 ? "..." : ""),
        extractedTextLength: extractedText.length,
        createdAt: application.createdAt,
      },
    });
  } catch (error) {
    console.error("Error in applyToJob:", error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get applications for logged-in candidate with populated job & company
 * @route   GET /api/applications/my-applications
 * @access  Private (Candidate)
 */
const getMyApplications = async (req, res) => {
  try {
    const candidateId = req.user._id;
    const candidateEmail = req.user.email.toLowerCase();

    const applications = await Application.find({
      $or: [{ candidateId }, { candidateEmail }],
    })
      .populate({
        path: "jobId",
        select: "title description requiredSkills experienceRequired location jobType recruiterId status",
        populate: {
          path: "recruiterId",
          select: "name company",
        },
      })
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    console.error("Error in getMyApplications:", error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Check application status for a specific job by logged-in candidate
 * @route   GET /api/applications/check-status/:jobId
 * @access  Private (Candidate)
 */
const checkJobApplicationStatus = async (req, res) => {
  try {
    const candidateId = req.user._id;
    const candidateEmail = req.user.email.toLowerCase();
    const { jobId } = req.params;

    const application = await Application.findOne({
      jobId,
      $or: [{ candidateId }, { candidateEmail }],
    }).select("status createdAt matchResult interview");

    if (application) {
      return res.json({
        applied: true,
        status: application.status,
        appliedAt: application.createdAt,
        matchScore: application.matchResult?.matchScore,
        interview: application.interview,
      });
    }

    res.json({ applied: false });
  } catch (error) {
    console.error("Error in checkJobApplicationStatus:", error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get all applications for a specific job (Ranked by matchScore)
 * @route   GET /api/applications/job/:jobId
 * @access  Private (Recruiter)
 */
const getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId).populate("recruiterId", "name company");
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const applications = await Application.find({ jobId })
      .populate("jobId", "title requiredSkills experienceRequired")
      .sort({ "matchResult.matchScore": -1, createdAt: -1 });

    res.json({
      job,
      applications,
    });
  } catch (error) {
    console.error("Error in getJobApplications:", error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get all scheduled interviews for recruiter
 * @route   GET /api/applications/interviews
 * @access  Private (Recruiter)
 */
const getScheduledInterviews = async (req, res) => {
  try {
    const applications = await Application.find({
      "interview.scheduledDate": { $exists: true, $ne: null },
    })
      .populate("jobId", "title location jobType")
      .sort({ "interview.scheduledDate": 1 });

    res.json(applications);
  } catch (error) {
    console.error("Error in getScheduledInterviews:", error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get single application by ID
 * @route   GET /api/applications/:id
 * @access  Private
 */
const getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id).populate("jobId");

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json(application);
  } catch (error) {
    console.error("Error in getApplicationById:", error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update candidate application status (Under Review, Shortlisted, etc.)
 * @route   PATCH /api/applications/:id/status
 * @access  Private (Recruiter)
 */
const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = [
      "Applied",
      "Under Review",
      "Shortlisted",
      "Interview Scheduled",
      "Selected",
      "Rejected",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    console.log(`Candidate ${application.candidateName} status updated to: ${status}`);

    res.json({
      message: `Candidate status updated to ${status}`,
      application,
    });
  } catch (error) {
    console.error("Error in updateApplicationStatus:", error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Schedule interview for candidate
 * @route   POST /api/applications/:id/interview
 * @access  Private (Recruiter)
 */
const scheduleInterview = async (req, res) => {
  try {
    const { scheduledDate, scheduledTime, interviewType, notes } = req.body;

    if (!scheduledDate || !scheduledTime) {
      return res.status(400).json({
        message: "Please provide interview date and time.",
      });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.interview = {
      scheduledDate,
      scheduledTime,
      interviewType: interviewType || "Online (Google Meet / Zoom)",
      notes: notes || "",
      status: "Pending",
    };
    application.status = "Interview Scheduled";

    await application.save();

    console.log(`Interview scheduled for candidate ${application.candidateName} on ${scheduledDate} at ${scheduledTime}`);

    res.json({
      message: "Interview scheduled successfully!",
      application,
    });
  } catch (error) {
    console.error("Error in scheduleInterview:", error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  applyToJob,
  getMyApplications,
  checkJobApplicationStatus,
  getJobApplications,
  getScheduledInterviews,
  getApplicationById,
  updateApplicationStatus,
  scheduleInterview,
};