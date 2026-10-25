import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Briefcase, LogOut, FileText, PlusCircle, User, LayoutDashboard, Calendar } from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isCandidate = user?.role === "candidate";
  const isRecruiter = user?.role === "recruiter";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <Briefcase size={26} color="#4f46e5" />
          <span>TalentAI</span>
        </Link>

        <div className="nav-links">
          <Link
            to="/"
            className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
          >
            Browse Jobs
          </Link>

          {token && user ? (
            <>
              {/* Candidate specific links */}
              {isCandidate && (
                <>
                  <Link
                    to="/dashboard"
                    className={`nav-link ${location.pathname === "/dashboard" ? "active" : ""}`}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                      <LayoutDashboard size={16} /> Dashboard
                    </span>
                  </Link>
                  <Link
                    to="/my-applications"
                    className={`nav-link ${location.pathname === "/my-applications" ? "active" : ""}`}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                      <FileText size={16} /> My Applications
                    </span>
                  </Link>
                  <Link
                    to="/profile"
                    className={`nav-link ${location.pathname === "/profile" ? "active" : ""}`}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                      <User size={16} /> Profile
                    </span>
                  </Link>
                </>
              )}

              {/* Recruiter specific links */}
              {isRecruiter && (
                <>
                  <Link
                    to="/dashboard"
                    className={`nav-link ${location.pathname === "/dashboard" ? "active" : ""}`}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                      <LayoutDashboard size={16} /> Dashboard
                    </span>
                  </Link>
                  <Link
                    to="/manage-jobs"
                    className={`nav-link ${location.pathname === "/manage-jobs" ? "active" : ""}`}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                      <PlusCircle size={16} /> Manage Jobs
                    </span>
                  </Link>
                  <Link
                    to="/interviews"
                    className={`nav-link ${location.pathname === "/interviews" ? "active" : ""}`}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                      <Calendar size={16} /> Interviews
                    </span>
                  </Link>
                </>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginLeft: "0.75rem" }}>
                <span
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    color: "#334155",
                    backgroundColor: isRecruiter ? "#eef2ff" : "#f0fdf4",
                    padding: "0.3rem 0.65rem",
                    borderRadius: "6px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  <User size={14} color={isRecruiter ? "#4f46e5" : "#16a34a"} />
                  {user.name} ({isRecruiter ? (user.company || "Recruiter") : "Candidate"})
                </span>
                <button
                  onClick={handleLogout}
                  className="btn btn-secondary btn-sm"
                  title="Logout"
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: "flex", gap: "10px" }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Create Account
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}