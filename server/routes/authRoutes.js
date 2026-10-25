const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  getCandidateProfile,
  updateProfileResume,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.put("/profile/resume", protect, upload.single("resume"), updateProfileResume);
router.get("/candidate-profile", protect, getCandidateProfile);

module.exports = router;