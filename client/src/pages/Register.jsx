import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { UserPlus, AlertCircle, User, Briefcase } from "lucide-react";

export default function Register() {
  const [role, setRole] = useState("candidate"); // "candidate" or "recruiter"
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    company: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        ...formData,
        role,
        company: role === "recruiter" ? formData.company : "",
      };

      const res = await API.post("/auth/register", payload);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data));

      if (res.data.role === "recruiter") {
        navigate("/dashboard");
      } else {
        navigate("/my-applications");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "460px", margin: "2.5rem auto" }}>
      <div className="card">
        <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              backgroundColor: "var(--primary-light)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem auto",
            }}
          >
            <UserPlus size={24} color="var(--primary)" />
          </div>
          <h2 className="card-title">Create an Account</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "4px" }}>
            Join TalentAI for smart resume screening and job applications
          </p>
        </div>

        {/* Role Toggle Selector */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "8px",
            backgroundColor: "#f1f5f9",
            padding: "4px",
            borderRadius: "8px",
            marginBottom: "1.25rem",
          }}
        >
          <button
            type="button"
            onClick={() => setRole("candidate")}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "0.55rem",
              borderRadius: "6px",
              border: "none",
              fontSize: "0.85rem",
              fontWeight: "600",
              backgroundColor: role === "candidate" ? "#ffffff" : "transparent",
              color: role === "candidate" ? "var(--primary)" : "var(--text-muted)",
              boxShadow: role === "candidate" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              transition: "all 0.2s",
            }}
          >
            <User size={15} /> Job Seeker
          </button>

          <button
            type="button"
            onClick={() => setRole("recruiter")}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "0.55rem",
              borderRadius: "6px",
              border: "none",
              fontSize: "0.85rem",
              fontWeight: "600",
              backgroundColor: role === "recruiter" ? "#ffffff" : "transparent",
              color: role === "recruiter" ? "var(--primary)" : "var(--text-muted)",
              boxShadow: role === "recruiter" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              transition: "all 0.2s",
            }}
          >
            <Briefcase size={15} /> Recruiter / HR
          </button>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: "var(--danger-bg)",
              color: "var(--danger)",
              padding: "0.75rem",
              borderRadius: "6px",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.88rem",
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              name="name"
              required
              className="form-input"
              placeholder="e.g. Sarah Jenkins"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          {role === "recruiter" && (
            <div className="form-group">
              <label className="form-label">Company / Institution *</label>
              <input
                type="text"
                name="company"
                required={role === "recruiter"}
                className="form-input"
                placeholder="e.g. Acme Corp or College Placement Cell"
                value={formData.company}
                onChange={handleChange}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              name="email"
              required
              className="form-input"
              placeholder={role === "candidate" ? "applicant@example.com" : "recruiter@company.com"}
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password *</label>
            <input
              type="password"
              name="password"
              required
              minLength={6}
              className="form-input"
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "0.5rem" }}
            disabled={loading}
          >
            {loading ? "Creating Account..." : `Sign Up as ${role === "candidate" ? "Job Seeker" : "Recruiter"}`}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.88rem" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ fontWeight: "600" }}>
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}