import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import "../styles/Navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  const path = location.pathname;
  const isLanding    = path === "/";
  const isSuperAdmin = path === "/super-admin";
  const isAuthPage   = path === "/login" || path === "/register";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Landing and super-admin have their own headers
  if (isLanding || isSuperAdmin) return null;

  // ── Neo-Brutalist nav for Login / Register ──────────────
  if (isAuthPage) {
    return (
      <header className="nb-nav">
        <div className="nb-nav-inner">
          <button className="nb-logo" onClick={() => navigate("/")}>
            <div className="nb-logo-box">⚡</div>
            <span>EventHub</span>
          </button>
          <nav className="nb-nav-links">
            <a href="/#featured" onClick={(e) => { e.preventDefault(); navigate("/"); }}>Browse Events</a>
            <a href="/#categories" onClick={(e) => { e.preventDefault(); navigate("/"); }}>Categories</a>
          </nav>
          <div className="nb-nav-right">
            {path === "/login" ? (
              <>
                <span className="nb-nav-hint">No account?</span>
                <button className="nb-btn-black" onClick={() => navigate("/register")}>Sign Up Free →</button>
              </>
            ) : (
              <>
                <span className="nb-nav-hint">Have an account?</span>
                <button className="nb-btn-outline" onClick={() => navigate("/login")}>Sign In</button>
              </>
            )}
          </div>
        </div>
      </header>
    );
  }

  // ── Standard nav for all other pages ───────────────────
  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          EventHub
        </Link>
        <div className="navbar-menu">
          {user ? (
            <>
              {user.role === "customer" && (
                <>
                  <Link to="/dashboard" className="navbar-link">Dashboard</Link>
                  <Link to="/bookings" className="navbar-link">My Tickets</Link>
                </>
              )}
              {(user.role === "organizer" || user.role === "admin") && (
                <>
                  <Link to="/my-events" className="navbar-link">My Events</Link>
                  <Link to="/events/create" className="navbar-link">Create Event</Link>
                </>
              )}
              {user.role === "admin" && (
                <Link to="/super-admin" className="navbar-link">Admin</Link>
              )}
              <div className="navbar-avatar" title={user.name}>
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <button onClick={handleLogout} className="navbar-btn">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link">Login</Link>
              <Link to="/register" className="navbar-btn">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
