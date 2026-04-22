import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Auth.css";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"customer" | "organizer">("customer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await register({ name, email, password, confirmPassword, role });
      navigate("/");
    } catch (error: unknown) {
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      setError(message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left-panel">
        
          
          
        
        <h1 className="auth-hero-text">
          Discover,<br />
          book &amp; manage<br />
          events<br />
          <span style={{ WebkitTextStroke: "2px #000", color: "transparent" }}>instantly.</span>
        </h1>
        <p className="auth-subhero-text">
          Join thousands of organizers and attendees.
          Experience the most secure and intuitive ticketing
          platform built for the modern era.
        </p>

        
        
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="auth-container">
        <div className="auth-card">
          <h2>Create account</h2>
          <p className="auth-subtitle">
            Sign up to start managing and discovering events.
          </p>

          {error && <div className="error-message">{error}</div>}

          {/* ── ROLE SELECTOR ── */}
          <div className="role-selector">
            <p className="role-selector-label">I want to join as a...</p>
            <div className="role-cards">
              <button
                type="button"
                className={`role-card ${role === "customer" ? "role-card-active" : ""}`}
                onClick={() => setRole("customer")}
              >
                
                <span className="role-card-title">Customer</span>
                <span className="role-card-desc">Browse & book tickets for events</span>
              </button>
              <button
                type="button"
                className={`role-card ${role === "organizer" ? "role-card-active" : ""}`}
                onClick={() => setRole("organizer")}
              >
                
                <span className="role-card-title">Organizer</span>
                <span className="role-card-desc">Create & manage your events</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Creating account..." : `Sign Up as ${role === "customer" ? "Customer" : "Organizer"}`}
            </button>
          </form>

          <p className="auth-footer" style={{ marginTop: "24px" }}>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}


