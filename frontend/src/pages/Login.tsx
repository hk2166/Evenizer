import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import "../styles/Auth.css";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState<
    "customer" | "organizer" | "admin"
  >("customer");

  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/");
    } catch (error: unknown) {
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;

      setError(message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse,
  ) => {
    if (!credentialResponse.credential) {
      setError("Google sign in did not return a credential.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await googleLogin(credentialResponse.credential);
      navigate("/");
    } catch (error: unknown) {
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;

      setError(message || "Google sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getWelcomeText = () => {
    switch (loginType) {
      case "customer":
        return "Welcome back";
      case "organizer":
        return "Organizer Portal";
      case "admin":
        return "Admin Dashboard";
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left-panel">
        <div className="auth-logo">
          <div className="auth-logo-icon"></div>
          EventHub
        </div>
        <h1 className="auth-hero-text">
          Discover, book,
          <br />
          and manage
          <br />
          events
          <br />
          seamlessly.
        </h1>
        <p className="auth-subhero-text">
          Join thousands of organizers and attendees.
          <br />
          Experience the most secure and intuitive ticketing
          <br />
          platform built for the modern era.
        </p>
      </div>

      <div className="auth-container">
        <div className="auth-card">
          <h2>{getWelcomeText()}</h2>
          <p className="auth-subtitle">Please enter your details to sign in.</p>

          <div className="login-tabs">
            <button
              type="button"
              className={`login-tab ${loginType === "customer" ? "active" : ""}`}
              onClick={() => setLoginType("customer")}
            >
              Customer
            </button>
            <button
              type="button"
              className={`login-tab ${loginType === "organizer" ? "active" : ""}`}
              onClick={() => setLoginType("organizer")}
            >
              Organizer
            </button>
            <button
              type="button"
              className={`login-tab ${loginType === "admin" ? "active" : ""}`}
              onClick={() => setLoginType("admin")}
            >
              Admin
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email or Username</label>
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

            <div className="form-options">
              <label>
                <input type="checkbox" /> Remember me
              </label>
              <Link to="/forgot-password">Forgot password?</Link>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="auth-divider">Or continue with</div>

          <div className="auth-social">
            {googleClientId ? (
              <div className="google-login-wrapper">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() =>
                    setError("Google sign in failed. Please try again.")
                  }
                  theme="outline"
                  size="large"
                  shape="pill"
                />
              </div>
            ) : (
              <button style={{ backgroundColor: "lightgray", cursor: "not-allowed", alignItems: "center", alignContent: "center" }} className="btn-social" type="button" disabled>
                <span>G</span> Google unavailable
              </button>
            )}
            
          </div>

          <p className="auth-footer">
            Don't have an account? <Link to="/register">Create account</Link>
          </p>

          <div className="auth-secure">Secure login authenticated via JWT</div>
        </div>
      </div>
    </div>
  );
}
