import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import EventList from "../components/dashboard/EventList";
import MyBookingsList from "../components/dashboard/MyBookingsList";
import BookingFlow from "../components/dashboard/BookingFlow";
import type { Event, TicketCategory } from "../types";
import { MOCK_EVENTS } from "../data/mockEvents";
import { LayoutGrid, Ticket, Music, Cpu, Trophy, Palette, Mic2, Search, LogOut, User, X, ChevronDown } from "lucide-react";

type Section = "browse" | "bookings";

const CATEGORIES = [
  { id: "all",    label: "All Events", icon: LayoutGrid },
  { id: "music",  label: "Music",      icon: Music },
  { id: "tech",   label: "Tech",       icon: Cpu },
  { id: "sports", label: "Sports",     icon: Trophy },
  { id: "arts",   label: "Arts",       icon: Palette },
  { id: "comedy", label: "Comedy",     icon: Mic2 },
];

export default function CustomerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [section, setSection]               = useState<Section>("browse");
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery]       = useState("");
  const [profileOpen, setProfileOpen]       = useState(false);
  const [bookingEvent, setBookingEvent]     = useState<Event | null>(null);
  const [bookingCategory, setBookingCategory] = useState<TicketCategory | null>(null);

  useEffect(() => {
    if (user && user.role !== "customer") navigate("/");
  }, [user, navigate]);

  const handleStartBooking = useCallback((ev: Event, cat: TicketCategory) => {
    setBookingEvent(ev); setBookingCategory(cat);
  }, []);
  const handleCloseBooking = useCallback(() => {
    setBookingEvent(null); setBookingCategory(null);
  }, []);
  const handleBookingSuccess = useCallback(() => {
    setBookingEvent(null); setBookingCategory(null); setSection("bookings");
  }, []);

  const filteredEvents = MOCK_EVENTS.filter((e) => {
    const matchCat    = activeCategory === "all" || e.category === activeCategory;
    const matchSearch = !searchQuery || e.title.toLowerCase().includes(searchQuery.toLowerCase()) || e.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "'Space Grotesk', 'Inter', sans-serif", color: "#000" }}>

      {/* ── NAV ── */}
      <header style={{ position: "sticky", top: 0, zIndex: 40, background: "#ffe17c", borderBottom: "2px solid #000" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", gap: 16 }}>

          {/* Logo */}
          <button onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 800, fontSize: "1.1rem", background: "none", border: "none", cursor: "pointer", letterSpacing: "-0.02em", flexShrink: 0, fontFamily: "inherit" }}>
            <div style={{ width: 36, height: 36, background: "#000", border: "2px solid #000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", color: "#ffe17c", boxShadow: "3px 3px 0 #000" }}>⚡</div>
            EventHub
          </button>

          {/* Search */}
          <div style={{ flex: 1, maxWidth: 480, position: "relative" }}>
            <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "#000", opacity: 0.4 }} />
            <input
              type="text"
              placeholder="SEARCH EVENTS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: "100%", paddingLeft: 38, paddingRight: searchQuery ? 36 : 14, paddingTop: 10, paddingBottom: 10, border: "2px solid #000", background: "#fff", fontSize: "0.82rem", fontWeight: 600, fontFamily: "inherit", outline: "none", boxShadow: "3px 3px 0 #000", letterSpacing: "0.04em", textTransform: "uppercase" }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer" }}>
                <X style={{ width: 14, height: 14 }} />
              </button>
            )}
          </div>

          {/* Nav tabs */}
          <div style={{ display: "flex", gap: 0, border: "2px solid #000", boxShadow: "3px 3px 0 #000", marginLeft: "auto" }}>
            {(["browse", "bookings"] as Section[]).map((s) => (
              <button key={s} onClick={() => setSection(s)} style={{ padding: "8px 18px", background: section === s ? "#000" : "transparent", color: section === s ? "#ffe17c" : "#000", border: "none", borderRight: s === "browse" ? "2px solid #000" : "none", fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer", fontFamily: "inherit" }}>
                {s === "browse" ? "Browse" : "My Tickets"}
              </button>
            ))}
          </div>

          {/* Profile */}
          <div style={{ position: "relative" }}>
            <button onClick={() => setProfileOpen((o) => !o)} style={{ display: "flex", alignItems: "center", gap: 8, background: "#000", border: "2px solid #000", padding: "6px 14px", cursor: "pointer", boxShadow: "3px 3px 0 #555", transition: "transform 0.12s, box-shadow 0.12s", fontFamily: "inherit" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translate(-2px,-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "5px 5px 0 #555"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "3px 3px 0 #555"; }}
            >
              <div style={{ width: 28, height: 28, background: "#ffe17c", border: "2px solid #ffe17c", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.9rem", color: "#000" }}>
                {user?.name?.charAt(0).toUpperCase() ?? "U"}
              </div>
              <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#fff", display: "none" }} className="sm-show">{user?.name?.split(" ")[0]}</span>
              <ChevronDown style={{ width: 14, height: 14, color: "#fff" }} />
            </button>

            {profileOpen && (
              <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 220, background: "#fff", border: "2px solid #000", boxShadow: "6px 6px 0 #000", zIndex: 50 }}>
                <div style={{ padding: "14px 16px", borderBottom: "2px solid #000" }}>
                  <p style={{ fontWeight: 800, fontSize: "0.9rem" }}>{user?.name}</p>
                  <p style={{ fontSize: "0.75rem", color: "#666", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</p>
                </div>
                {[
                  { icon: User, label: "Profile", action: () => { setSection("browse"); setProfileOpen(false); } },
                  { icon: Ticket, label: "My Bookings", action: () => { setSection("bookings"); setProfileOpen(false); } },
                ].map(({ icon: Icon, label, action }) => (
                  <button key={label} onClick={action} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "none", border: "none", borderBottom: "1px solid #eee", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem", fontFamily: "inherit", textAlign: "left" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#ffe17c"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "none"}
                  >
                    <Icon style={{ width: 14, height: 14 }} /> {label}
                  </button>
                ))}
                <button onClick={() => { logout(); navigate("/login"); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "none", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "0.85rem", color: "#ff4444", fontFamily: "inherit", textAlign: "left" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#fff5f5"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "none"}
                >
                  <LogOut style={{ width: 14, height: 14 }} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px", display: "flex", gap: 24 }}>

        {/* ── SIDEBAR ── */}
        <aside style={{ width: 200, flexShrink: 0, display: "flex", flexDirection: "column", gap: 0 }} className="dash-sidebar">
          <p style={{ fontSize: "0.68rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "#666", padding: "0 12px", marginBottom: 8 }}>Navigation</p>

          {(["browse", "bookings"] as Section[]).map((s) => (
            <SidebarBtn key={s} label={s === "browse" ? "Browse Events" : "My Bookings"} active={section === s} onClick={() => setSection(s)} />
          ))}

          <p style={{ fontSize: "0.68rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "#666", padding: "0 12px", marginTop: 24, marginBottom: 8 }}>Categories</p>

          {CATEGORIES.map((cat) => (
            <SidebarBtn key={cat.id} label={cat.label} active={section === "browse" && activeCategory === cat.id} onClick={() => { setSection("browse"); setActiveCategory(cat.id); }} />
          ))}
        </aside>

        {/* ── MAIN ── */}
        <main style={{ flex: 1, minWidth: 0 }}>
          {section === "browse" && (
            <EventList events={filteredEvents} activeCategory={activeCategory} onCategoryChange={setActiveCategory} onStartBooking={handleStartBooking} />
          )}
          {section === "bookings" && <MyBookingsList />}
        </main>
      </div>

      {/* Booking modal */}
      {bookingEvent && bookingCategory && (
        <BookingFlow event={bookingEvent} initialCategory={bookingCategory} onClose={handleCloseBooking} onSuccess={handleBookingSuccess} />
      )}

      {profileOpen && <div style={{ position: "fixed", inset: 0, zIndex: 30 }} onClick={() => setProfileOpen(false)} />}
    </div>
  );
}

function SidebarBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", padding: "10px 12px", background: active ? "#ffe17c" : "transparent", border: active ? "2px solid #000" : "2px solid transparent", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", textAlign: "left", width: "100%", fontFamily: "inherit", marginBottom: 4, boxShadow: active ? "3px 3px 0 #000" : "none", transition: "all 0.12s ease" }}
      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "#f5f5f5"; }}
      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
    >
      {label}
    </button>
  );
}
