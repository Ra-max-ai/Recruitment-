import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { LogIn, AlertCircle, User, Briefcase } from "lucide-react";

export default function Login() {
  const [role, setRole] = useState("candidate"); // "candidate" or "recruiter"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await API.post("/auth/login", { email, password });
      
      // Save token and user details to localStorage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data));

      // Redirect based on user's registered role
      if (res.data.role === "recruiter") {
        navigate("/dashboard");
      } else {
        navigate("/my-applications");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid credentials. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "440px", margin: "2.5rem auto" }}>
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
            <LogIn size={24} color="var(--primary)" />
          </div>
          <h2 className="card-title">Welcome Back</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "4px" }}>
            Sign in to access your recruitment portal
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
            <label className="form-label">Email Address</label>
            <input
              type="email"
              required
              className="form-input"
              placeholder={role === "candidate" ? "applicant@example.com" : "recruiter@company.com"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              required
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "0.5rem" }}
            disabled={loading}
          >
            {loading ? "Authenticating..." : `Sign In as ${role === "candidate" ? "Job Seeker" : "Recruiter"}`}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.88rem" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ fontWeight: "600" }}>
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}