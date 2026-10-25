const User = require("../models/User");
const Application = require("../models/Application");
const jwt = require("jsonwebtoken");
const { extractResumeText } = require("../services/textExtractor");
const { extractResumeDetails } = require("../services/resumeParser");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

/**
 * Register User (Candidate or Recruiter)
 * POST /api/auth/register
 */
const registerUser = async (req, res) => {
  try {
    const { name, email, password, company, role, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide name, email, and password" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }

    // Role can be "recruiter" or "candidate"
    const assignedRole = role === "recruiter" ? "recruiter" : "candidate";

    const user = await User.create({
      name,
      email,
      password,
      phone: phone || "",
      company: assignedRole === "recruiter" ? (company || "Recruiting Organization") : "",
      role: assignedRole,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        company: user.company,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Error in registerUser:", error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Login User (Candidate or Recruiter)
 * POST /api/auth/login
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        company: user.company,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Error in loginUser:", error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get current logged in user profile
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error in getMe:", error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update candidate / user profile
 * PUT /api/auth/profile
 * @access Private
 */
const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      company: user.company,
      role: user.role,
      message: "Profile updated successfully!",
    });
  } catch (error) {
    console.error("Error in updateProfile:", error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get Candidate Profile with latest extracted resume details
 * GET /api/auth/candidate-profile
 * @access Private (Candidate)
 */
const getCandidateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find candidate's latest application to reuse extracted resume data
    const latestApplication = await Application.findOne({
      $or: [{ candidateId: user._id }, { candidateEmail: user.email.toLowerCase() }],
    })
      .populate("jobId", "title")
      .sort({ createdAt: -1 });

    const totalApplications = await Application.countDocuments({
      $or: [{ candidateId: user._id }, { candidateEmail: user.email.toLowerCase() }],
    });

    let latestResume = null;
    if (user.profileResume && user.profileResume.fileName) {
      latestResume = {
        fileName: user.profileResume.fileName,
        filePath: user.profileResume.filePath,
        uploadedAt: user.profileResume.uploadedAt,
        phone: user.phone,
        extractedData: user.profileResume.extractedData,
      };
    } else if (latestApplication) {
      latestResume = {
        fileName: latestApplication.resumeFileName,
        filePath: latestApplication.resumeFilePath,
        uploadedAt: latestApplication.createdAt,
        phone: latestApplication.candidatePhone || user.phone,
        extractedData: latestApplication.extractedData,
      };
    }

    res.json({
      user,
      totalApplications,
      latestResume,
    });
  } catch (error) {
    console.error("Error in getCandidateProfile:", error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Upload / Update Candidate Profile Resume
 * PUT /api/auth/profile/resume
 * @access Private (Candidate)
 */
const updateProfileResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a resume file (PDF or DOCX)" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Extract text from uploaded resume
    const resumeText = await extractResumeText(req.file.path, req.file.originalname);
    const parsedData = extractResumeDetails(resumeText);

    user.profileResume = {
      fileName: req.file.originalname,
      filePath: `/uploads/${req.file.filename}`,
      uploadedAt: new Date(),
      extractedData: {
        skills: parsedData.skills || [],
        experienceYears: parsedData.experienceYears || 0,
        education: parsedData.education || [],
      },
    };

    if (parsedData.phone && !user.phone) {
      user.phone = parsedData.phone;
    }

    await user.save();

    res.json({
      message: "Resume updated and parsed successfully!",
      latestResume: {
        fileName: user.profileResume.fileName,
        filePath: user.profileResume.filePath,
        uploadedAt: user.profileResume.uploadedAt,
        phone: user.phone,
        extractedData: user.profileResume.extractedData,
      },
    });
  } catch (error) {
    console.error("Error in updateProfileResume:", error.message);
    res.status(500).json({ message: error.message || "Failed to parse and update resume" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  registerRecruiter: registerUser, // Alias for backwards compatibility
  loginRecruiter: loginUser,       // Alias for backwards compatibility
  getMe,
  updateProfile,
  getCandidateProfile,
  updateProfileResume,
};