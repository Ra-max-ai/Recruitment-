import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { Plus, Users, Trash2, CheckCircle, AlertCircle } from "lucide-react";

export default function ManageJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requiredSkills: "",
    experienceRequired: 1,
    educationRequired: "Bachelor's Degree in Computer Science or related field",
    location: "Remote / Hybrid",
    jobType: "Full-time",
  });

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchJobs();
  }, [token]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await API.get("/jobs");
      setJobs(res.data);
    } catch (err) {
      setError("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await API.post("/jobs", formData);
      setSuccess("Job opening successfully posted!");
      setShowForm(false);
      setFormData({
        title: "",
        description: "",
        requiredSkills: "",
        experienceRequired: 1,
        educationRequired: "Bachelor's Degree in Computer Science or related field",
        location: "Remote / Hybrid",
        jobType: "Full-time",
      });
      fetchJobs();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create job");
    }
  };

  const handleDeleteJob = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job and its applications?")) return;
    try {
      await API.delete(`/jobs/${id}`);
      fetchJobs();
    } catch (err) {
      alert(err.response?.data?.message || "Could not delete job");
    }
  };

  return (
    <div>
      <div className="flex-between mb-4">
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: "800" }}>Manage Job Postings</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            Create jobs, define skill requirements, and evaluate applicants
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          <Plus size={18} /> {showForm ? "Cancel" : "Post New Job"}
        </button>
      </div>

      {success && (
        <div
          style={{
            backgroundColor: "var(--success-bg)",
            color: "var(--success)",
            padding: "0.75rem",
            borderRadius: "6px",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <CheckCircle size={18} /> <span>{success}</span>
        </div>
      )}

      {error && (
        <div
          style={{
            backgroundColor: "var(--danger-bg)",
            color: "var(--danger)",
            padding: "0.75rem",
            borderRadius: "6px",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <AlertCircle size={18} /> <span>{error}</span>
        </div>
      )}

      {/* Create Job Form */}
      {showForm && (
        <div className="card mb-4" style={{ borderLeft: "4px solid var(--primary)" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "1.25rem" }}>
            Post a New Vacancy
          </h2>
          <form onSubmit={handleCreateJob}>
            <div className="form-group">
              <label className="form-label">Job Title *</label>
              <input
                type="text"
                name="title"
                required
                className="form-input"
                placeholder="e.g. Senior Frontend Engineer"
                value={formData.title}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Job Description *</label>
              <textarea
                name="description"
                rows="4"
                required
                className="form-textarea"
                placeholder="Describe role responsibilities, team goals, and expectations..."
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Required Technical Skills * (Comma separated)
              </label>
              <input
                type="text"
                name="requiredSkills"
                required
                className="form-input"
                placeholder="e.g. React, Node.js, Express, MongoDB, REST APIs"
                value={formData.requiredSkills}
                onChange={handleInputChange}
              />
              <small style={{ color: "var(--text-muted)", display: "block", marginTop: "4px" }}>
                The AI will use these exact skills to match and score candidate resumes.
              </small>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Min. Experience (Years) *</label>
                <input
                  type="number"
                  name="experienceRequired"
                  min="0"
                  required
                  className="form-input"
                  value={formData.experienceRequired}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Job Type</label>
                <select
                  name="jobType"
                  className="form-select"
                  value={formData.jobType}
                  onChange={handleInputChange}
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  name="location"
                  className="form-input"
                  placeholder="e.g. Remote / New York / Hybrid"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Education Requirement</label>
                <input
                  type="text"
                  name="educationRequired"
                  className="form-input"
                  value={formData.educationRequired}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "1rem" }}>
              <button type="submit" className="btn btn-primary">
                Publish Job
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Jobs Table */}
      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Loading jobs...</p>
      ) : jobs.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <h3>No jobs posted yet</h3>
          <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
            Click "+ Post New Job" above to create your first opening.
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Experience</th>
                <th>Skills Required</th>
                <th>Applicants</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job._id}>
                  <td>
                    <strong>{job.title}</strong>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      {job.location} • {job.jobType}
                    </div>
                  </td>
                  <td>{job.experienceRequired} yrs</td>
                  <td style={{ maxWidth: "280px" }}>
                    {job.requiredSkills.slice(0, 3).map((skill, i) => (
                      <span key={i} className="skill-tag">
                        {skill}
                      </span>
                    ))}
                    {job.requiredSkills.length > 3 && (
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        +{job.requiredSkills.length - 3} more
                      </span>
                    )}
                  </td>
                  <td>
                    <span className="badge badge-review">
                      <Users size={13} /> {job.applicantCount || 0} Candidates
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <Link
                        to={`/job-applicants/${job._id}`}
                        className="btn btn-primary btn-sm"
                      >
                        Rank Applicants
                      </Link>
                      <button
                        onClick={() => handleDeleteJob(job._id)}
                        className="btn btn-danger btn-sm"
                        title="Delete Job"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}