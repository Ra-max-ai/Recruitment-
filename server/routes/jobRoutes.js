const express = require("express");
const router = express.Router();
const {
  getJobs,
  getJobById,
  createJob,
  deleteJob,
} = require("../controllers/jobController");
const { protect } = require("../middleware/auth");

router.route("/").get(getJobs).post(protect, createJob);
router.route("/:id").get(getJobById).delete(protect, deleteJob);

module.exports = router;
