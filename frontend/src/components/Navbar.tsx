import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import "../styles/Navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

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

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          EventHub
        </Link>

        <div className="navbar-menu">
          <Link to="/" className="navbar-link">
            Home
          </Link>

          {user ? (
            <>
              {/* Role-based navigation items */}
              {user.role === "customer" && (
                <Link to="/bookings" className="navbar-link">
                  My Bookings
                </Link>
              )}

              {(user.role === "organizer" || user.role === "admin") && (
                <>
                  <Link to="/my-events" className="navbar-link">
                    My Events
                  </Link>
                  <Link to="/events/create" className="navbar-link">
                    Create Event
                  </Link>
                </>
              )}

              <span className="navbar-user">Hello, {user.name}</span>
              <button onClick={handleLogout} className="navbar-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link">
                Login
              </Link>
              <Link to="/register" className="navbar-btn">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
