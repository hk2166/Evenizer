import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import "../styles/Navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  const isHome = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Landing page and super-admin have their own headers
  if (isHome || location.pathname === "/super-admin") return null;

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""} ${isHome ? "navbar-light" : ""}`}>
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
                <Link to="/admin" className="navbar-link">Admin</Link>
              )}
              <div className="navbar-avatar" title={user.name}>
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <button onClick={handleLogout} className="navbar-btn">
                Logout
              </button>
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
