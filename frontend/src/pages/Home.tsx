import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { eventAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import type { Event } from "../types";
import "../styles/Home.css";

const getEntityId = (entity: { id?: string; _id?: string }) => entity.id ?? entity._id ?? "";

const CATEGORIES = ["All Events", "Music", "Sports", "Theater", "Conferences"];

function getCategoryLabel(event: Event): string {
  const t = (event.title + " " + event.description).toLowerCase();
  if (t.includes("music") || t.includes("concert") || t.includes("festival") || t.includes("dj")) return "Music";
  if (t.includes("sport") || t.includes("game") || t.includes("match")) return "Sports";
  if (t.includes("theater") || t.includes("play") || t.includes("musical")) return "Theater";
  if (t.includes("conference") || t.includes("summit") || t.includes("tech")) return "Conferences";
  return "Other";
}

function getCategoryColor(category: string): string {
  switch (category) {
    case "Music": return "#8b5cf6"; // purple
    case "Sports": return "#f97316"; // orange
    case "Theater": return "#d946ef"; // pink
    case "Conferences": return "#3b82f6"; // blue
    default: return "#64748b"; // gray
  }
}

function getLowestPrice(event: Event): string {
  const cats = event.ticketCategories;
  if (!cats || cats.length === 0) return "Free";
  const prices = cats.map((c) => c.price).filter((p) => p >= 0);
  if (prices.length === 0) return "Free";
  const min = Math.min(...prices);
  return min === 0 ? "Free" : `From ₹${min.toLocaleString()}`;
}

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Events");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isOrganizer = user?.role === "organizer" || user?.role === "admin";
  const isCustomer = user?.role === "customer";

  useEffect(() => {
    eventAPI.getAllEvents()
      .then((d) => {
        setEvents(d.events || []);
        setError("");
      })
      .catch(() => {
        setError("Failed to load events. Please try again.");
      })
      .finally(() => setLoading(false));
  }, []);

  const openEvent = (event: Event) => {
    const eventId = getEntityId(event);
    if (!eventId) {
      setError("This event is missing an ID and cannot be opened.");
      return;
    }

    navigate(`/events/${eventId}`);
  };

  const filtered = events.filter((e) => {
    const cat = getCategoryLabel(e);
    const matchCat = activeCategory === "All Events" || cat === activeCategory;
    const matchSearch = !searchQuery ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="home-modern">
      {/* ── NAVBAR ── */}
      <header className="modern-header">
        <div className="header-left">
          <div className="modern-logo" onClick={() => navigate("/")}>
            
            <span>EventHub</span>
          </div>
          <div className="search-bar">
            <span className="search-icon"></span>
            <input
              type="text"
              placeholder="Search events, artists, venues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="header-right">
          {user ? (
            <div className="user-menu">
              <div className={`role-badge ${isOrganizer ? "role-organizer" : "role-customer"}`}>
                {isOrganizer ? " Organizer" : " Customer"}
              </div>
              {isCustomer && (
                <button className="btn-outline" onClick={() => navigate("/bookings")}>My Tickets</button>
              )}
              {isOrganizer && (
                <>
                  <button className="btn-outline" onClick={() => navigate("/my-events")}>My Events</button>
                  <button className="btn-outline" onClick={() => navigate("/events/create")}>+ Create Event</button>
                </>
              )}
              {user.role === "admin" && (
                <button className="btn-outline" onClick={() => navigate("/super-admin")}>Admin Panel</button>
              )}
              <button className="btn-primary-pill" onClick={logout}>Log Out</button>
            </div>
          ) : (
            <div className="auth-buttons">
              <button className="btn-outline" onClick={() => navigate("/login")}>Log In</button>
              <button className="btn-primary-pill" onClick={() => navigate("/register")}>Sign Up Free</button>
            </div>
          )}
        </div>
      </header>

      {/* ── HERO BANNER ── */}
      <section className="hero-banner">
        <div className="hero-content">
          {user ? (
            isOrganizer ? (
              <>
                <div className="hero-eyebrow"> Welcome back, Organizer</div>
                <h1>Manage your events,<br/>grow your audience.</h1>
                <p>Create, publish and track your events all in one place.</p>
                <div className="hero-cta-row">
                  <button className="btn-get-tickets" onClick={() => navigate("/events/create")}>+ Create New Event</button>
                  <button className="btn-hero-secondary" onClick={() => navigate("/my-events")}>View My Events →</button>
                </div>
              </>
            ) : (
              <>
                <div className="hero-eyebrow"> Ready to explore?</div>
                <h1>Discover events<br/>happening near you.</h1>
                <p>Book tickets for music, sports, theater and more.</p>
                <div className="hero-cta-row">
                  <button className="btn-get-tickets" onClick={() => navigate("/bookings")}>My Tickets →</button>
                </div>
              </>
            )
          ) : (
            <>
              <div className="hero-eyebrow"> The smarter way to experience events</div>
              <h1>Discover, book &<br/>create events.</h1>
              <p>Join thousands of organizers and attendees on EventHub.<br/>Sign up as a Customer or Event Organizer.</p>
              <div className="hero-cta-row">
                <button className="btn-get-tickets" onClick={() => navigate("/register")}>Get Started Free →</button>
                <button className="btn-hero-secondary" onClick={() => navigate("/login")}>Already have an account?</button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── FILTER TABS ── */}
      <section className="filter-section">
        <div className="filter-tabs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`filter-pill ${activeCategory === cat ? "active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="filter-actions">
          <button className="action-pill"> This Weekend</button>
          <button className="action-pill"> Filters</button>
        </div>
      </section>

      {/* ── EVENT LISTINGS ── */}
      <section className="event-listings">
        {error && <div className="cards-empty">{error}</div>}
        {loading ? (
          <div className="cards-loading">Loading events...</div>
        ) : filtered.length === 0 ? (
          <div className="cards-empty">No events found matching your criteria.</div>
        ) : (
          <div className="modern-grid">
            {filtered.map((event) => {
              const catLabel = getCategoryLabel(event);
              const catColor = getCategoryColor(catLabel);
              const eventId = getEntityId(event);
              const priceLabel = getLowestPrice(event);

              return (
                <div
                  key={eventId}
                  className="modern-card"
                  onClick={() => openEvent(event)}
                >
                  <div className="card-image-region">
                    {event.imageUrl ? (
                      <img src={event.imageUrl} alt={event.title} />
                    ) : (
                      <div className="image-placeholder" />
                    )}
                    <button className="btn-heart" onClick={(e) => { e.stopPropagation(); }}>♡</button>
                    <div className="card-badge" style={{ backgroundColor: catColor }}>
                      {catLabel.toUpperCase()}
                    </div>
                  </div>
                  <div className="card-content">
                    <h3 className="event-name">{event.title}</h3>
                    <p className="event-date">
                      {new Date(event.date).toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                    <p className="event-venue">{event.location}</p>
                    <p className="event-price">{priceLabel}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
