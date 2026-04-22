import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { eventAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import type { Event } from "../types";
import "../styles/Landing.css";

/* ─── Helper: scroll to section ────────────────── */
function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

/* ─── Static display data (no real IDs needed) ── */
const LIVE_EVENTS = [
  { id: 1, title: "Neon Nights Festival", venue: "Brookside Arena, Mumbai", time: "LIVE NOW", badge: "LIVE", seats: 142, price: "₹1,499" },
  { id: 2, title: "FutureTech Summit", venue: "Jio World Centre", time: "Starts in 2h", badge: "TRENDING", seats: 67, price: "₹2,999" },
  { id: 3, title: "Coldplay World Tour", venue: "NM Stadium, Ahmedabad", time: "Nov 22", badge: "LIMITED", seats: 89, price: "₹7,500" },
  { id: 4, title: "Vir Das: Losing It", venue: "St Andrews, Bandra", time: "Aug 05", badge: "HOT", seats: 234, price: "₹799" },
  { id: 5, title: "AI & ML Bootcamp", venue: "IIT Bombay", time: "Oct 05", badge: "TRENDING", seats: 78, price: "₹4,999" },
];

const CATEGORIES = [
  { icon: "🎵", label: "Music", count: "2,400+ events" },
  { icon: "💻", label: "Tech", count: "890+ events" },
  { icon: "🏆", label: "Sports", count: "1,200+ events" },
  { icon: "🎭", label: "Theater", count: "340+ events" },
  { icon: "🎤", label: "Comedy", count: "560+ events" },
  { icon: "🎨", label: "Arts", count: "420+ events" },
  { icon: "🏋️", label: "Fitness", count: "780+ events" },
  { icon: "🍕", label: "Food & Drink", count: "290+ events" },
];

const FEATURED_STATIC = [
  { title: "Zakir Hussain — Tabla Maestro", date: "Jul 20, 7:30 PM", venue: "NCPA, Mumbai", price: "₹1,500", seats: 45, badge: "LIMITED SEATS", color: "#ffe17c" },
  { title: "Champions League Watch Party", date: "Jun 01, 9:30 PM", venue: "DY Patil Stadium", price: "₹499", seats: 1240, badge: "AVAILABLE", color: "#b7c6c2" },
  { title: "Mumbai Marathon 2026", date: "Jan 18, 5:30 AM", venue: "Azad Maidan", price: "₹599", seats: 2340, badge: "AVAILABLE", color: "#fff" },
];

const BANNER_COLORS = ["#ffe17c", "#b7c6c2", "#fff", "#171e19", "#f0f0f0"];

const TESTIMONIALS = [
  { name: "Priya S.", role: "Music Fan", text: "Booked Coldplay tickets in under 60 seconds. The seat timer kept me focused — no dithering!", stars: 5 },
  { name: "Rahul M.", role: "Event Organizer", text: "Sold out our 5,000-seat festival in 4 hours. Real-time seat tracking is a game changer.", stars: 5 },
  { name: "Ananya I.", role: "Comedy Club Owner", text: "Setup took 8 minutes. Tickets live before my coffee was done. Insane product.", stars: 5 },
];

/* ─── Countdown hook ────────────────────────────── */
function useCountdown(seconds: number) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    const t = setInterval(() => setLeft(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  const m = String(Math.floor(left / 60)).padStart(2, "0");
  const s = String(left % 60).padStart(2, "0");
  return `${m}:${s}`;
}

/* ─── Sub-components ────────────────────────────── */
function LiveBadge({ type }: { type: string }) {
  const map: Record<string, string> = {
    "LIVE": "badge-live", "TRENDING": "badge-trending",
    "LIMITED": "badge-limited", "HOT": "badge-hot",
  };
  return <span className={`ev-badge ${map[type] ?? "badge-hot"}`}>{type}</span>;
}

function ReservationTimer() {
  const time = useCountdown(14 * 60 + 37);
  const [m, s] = time.split(":");
  const urgent = parseInt(m) < 3;
  return (
    <div className={`res-timer ${urgent ? "res-timer-urgent" : ""}`}>
      <div className="res-timer-label"> YOUR SEATS HELD FOR</div>
      <div className="res-timer-display">
        <span className="res-digit">{m}</span>
        <span className="res-colon">:</span>
        <span className="res-digit">{s}</span>
      </div>
      <div className="res-timer-sub">Complete payment before time runs out</div>
    </div>
  );
}

/* ─── Main component ────────────────────────────── */
export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  // Real events from backend
  const [realEvents, setRealEvents] = useState<Event[]>([]);

  useEffect(() => {
    eventAPI.getAllEvents()
      .then((d) => setRealEvents(d.events || []))
      .catch(() => {}); // silently fail — static fallback still shows
  }, []);

  // Helper: get real event ID
  const getEventId = (ev: Event) => ev.id || (ev as any)._id || "";

  // "Browse All Events" → dashboard if logged in, else register
  const handleBrowseAll = () => {
    if (user?.role === "customer") navigate("/dashboard");
    else if (user?.role === "organizer" || user?.role === "admin") navigate("/my-events");
    else navigate("/register");
  };

  // "Book Now" on a real event card
  const handleBookEvent = (ev: Event) => {
    const id = getEventId(ev);
    if (id) navigate(`/events/${id}`);
    else scrollTo("featured");
  };

  // "Book Now" on static hero/live cards → go to register if not logged in
  const handleStaticBook = () => {
    if (user) scrollTo("featured");
    else navigate("/register");
  };

  return (
    <div className="lp">

      {/* ══ NAV ══════════════════════════════════════ */}
      <header className="lp-nav">
        <div className="lp-nav-inner">
          <button className="lp-logo" onClick={() => navigate("/")}>
            <div className="lp-logo-box">⚡</div>
            <span>EventHub</span>
          </button>

          <nav className="lp-nav-links">
            <a href="#featured" onClick={() => scrollTo("featured")}>Browse Events</a>
            <a href="#categories">Categories</a>
            <a href="#how">How It Works</a>
          </nav>

          <div className="lp-nav-right">
            <button className="lp-btn-ghost" onClick={() => navigate("/login")}>Login</button>
            <button className="lp-btn-white" onClick={() => navigate("/register")}>Sign Up</button>
            <button className="lp-btn-black" onClick={() => navigate("/events/create")}>+ Create Event</button>
          </div>

          <button className="lp-hamburger" onClick={() => setMenuOpen(o => !o)}>☰</button>
        </div>

        {menuOpen && (
          <div className="lp-mobile-menu">
            <a href="#featured" onClick={() => { scrollTo("featured"); setMenuOpen(false); }}>Browse Events</a>
            <a href="#categories" onClick={() => setMenuOpen(false)}>Categories</a>
            <button onClick={() => navigate("/login")}>Login</button>
            <button onClick={() => navigate("/register")}>Sign Up</button>
            <button onClick={() => navigate("/events/create")}>+ Create Event</button>
          </div>
        )}
      </header>

      {/* ══ HERO ═════════════════════════════════════ */}
      <section className="lp-hero">
        <div className="lp-dot-bg" />
        <div className="lp-hero-inner">

          {/* Left */}
          <div className="lp-hero-left">
            
            <h1 className="lp-hero-h1">
              Discover &amp;<br />
              Book Events<br />
              <span className="lp-outline">Instantly.</span>
            </h1>
            <p className="lp-hero-sub">
              Real-time seat availability. 15-minute reservation hold.
              Secure payments. From intimate gigs to stadium concerts.
            </p>
            <div className="lp-hero-ctas">
              <button className="lp-btn-black lp-btn-xl" onClick={() => scrollTo("featured")}>
                Explore Events →
              </button>
              <button className="lp-btn-white lp-btn-xl" onClick={() => navigate("/register")}>
                Host an Event
              </button>
            </div>
           
          </div>

          {/* Right — stacked event cards mockup */}
          <div className="lp-hero-right">
            <div className="lp-hero-cards">
              {[
                { title: "Coldplay World Tour", date: "Nov 22 · Ahmedabad", badge: "LIMITED", seats: 89, price: "₹7,500", rotate: "-3deg", top: "0", left: "0", zIndex: 3 },
                { title: "Neon Nights Festival", date: "Aug 15 · Mumbai", badge: "LIVE", seats: 142, price: "₹1,499", rotate: "2deg", top: "60px", left: "30px", zIndex: 2 },
                { title: "FutureTech Summit", date: "Sep 10 · Mumbai", badge: "TRENDING", seats: 312, price: "₹2,999", rotate: "-1deg", top: "120px", left: "10px", zIndex: 1 },
              ].map((c, i) => (
                <div key={i} className="lp-hero-card" style={{ transform: `rotate(${c.rotate})`, marginTop: i > 0 ? "-80px" : "0", zIndex: c.zIndex, position: "relative" }}>
                  <div className="lp-hero-card-top">
                    <LiveBadge type={c.badge} />
                    <span className="lp-hero-card-seats">{c.seats} seats left</span>
                  </div>
                  <div className="lp-hero-card-title">{c.title}</div>
                  <div className="lp-hero-card-date">{c.date}</div>
                  <div className="lp-hero-card-footer">
                    <span className="lp-hero-card-price">{c.price}</span>
                    <button className="lp-btn-black lp-btn-sm" onClick={handleStaticBook}>Book Now</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ LIVE EVENTS STRIP ════════════════════════ */}
      <section className="lp-live-strip">
        <div className="lp-live-header">
          <div className="lp-live-title">
            <span className="lp-live-dot" />
            HAPPENING NOW
          </div>
          <button className="lp-btn-yellow lp-btn-sm" onClick={handleBrowseAll}>View All →</button>
        </div>
        <div className="lp-live-scroll">
          {LIVE_EVENTS.map(ev => (
            <div key={ev.id} className="lp-live-card">
              <div className="lp-live-card-top">
                <LiveBadge type={ev.badge} />
                <span className="lp-live-time">{ev.time}</span>
              </div>
              <div className="lp-live-card-title">{ev.title}</div>
              <div className="lp-live-card-venue">{ev.venue}</div>
              <div className="lp-live-card-footer">
                <div>
                  <div className="lp-live-price">{ev.price}</div>
                  <div className="lp-live-seats">{ev.seats} seats left</div>
                </div>
                <button className="lp-btn-yellow lp-btn-sm" onClick={handleStaticBook}>Book Now</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ CATEGORIES ═══════════════════════════════ */}
      <section className="lp-cats" id="categories">
        <div className="lp-section-inner">
          <div className="lp-section-tag">Categories</div>
          <h2 className="lp-section-h2">Find your kind of event.</h2>
          <div className="lp-cats-grid">
            {CATEGORIES.map(cat => (
              <button key={cat.label} className="lp-cat-card" onClick={handleBrowseAll}>
                <div className="lp-cat-icon">{cat.icon}</div>
                <div className="lp-cat-label">{cat.label}</div>
                <div className="lp-cat-count">{cat.count}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURED EVENTS ══════════════════════════ */}
      <section className="lp-featured" id="featured">
        <div className="lp-dot-bg" />
        <div className="lp-section-inner">
          <div className="lp-section-tag lp-tag-dark">Featured Events</div>
          <h2 className="lp-section-h2">Don't miss these.</h2>
          <div className="lp-featured-grid">
            {/* Show real events if available, else static fallback */}
            {(realEvents.length > 0 ? realEvents.slice(0, 3) : FEATURED_STATIC).map((ev, i) => {
              const isReal = realEvents.length > 0;
              const title = isReal ? (ev as Event).title : (ev as typeof FEATURED_STATIC[0]).title;
              const date = isReal
                ? new Date((ev as Event).date).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                : (ev as typeof FEATURED_STATIC[0]).date;
              const venue = isReal ? (ev as Event).location : (ev as typeof FEATURED_STATIC[0]).venue;
              const price = isReal
                ? (() => {
                    const cats = (ev as Event).ticketCategories;
                    if (!cats || cats.length === 0) return "Free";
                    const min = Math.min(...cats.map(c => c.price));
                    return `₹${min.toLocaleString()}`;
                  })()
                : (ev as typeof FEATURED_STATIC[0]).price;
              const seats = isReal
                ? (ev as Event).ticketCategories?.reduce((s, c) => s + c.availableSeats, 0) ?? 0
                : (ev as typeof FEATURED_STATIC[0]).seats;
              const badge = isReal
                ? (seats === 0 ? "SOLD OUT" : seats < 50 ? "LIMITED SEATS" : "AVAILABLE")
                : (ev as typeof FEATURED_STATIC[0]).badge;
              const color = BANNER_COLORS[i % BANNER_COLORS.length];

              return (
                <div
                  key={title}
                  className="lp-feat-card"
                  onClick={() => isReal ? handleBookEvent(ev as Event) : handleStaticBook()}
                  style={{ cursor: "pointer" }}
                >
                  <div className="lp-feat-banner" style={{ background: color }}>
                    <span className={`ev-badge ${badge === "LIMITED SEATS" || badge === "SOLD OUT" ? "badge-limited" : "badge-trending"}`}>
                      {badge}
                    </span>
                  </div>
                  <div className="lp-feat-body">
                    <div className="lp-feat-title">{title}</div>
                    <div className="lp-feat-meta">
                      <span>📅 {date}</span>
                      <span>📍 {venue}</span>
                    </div>
                    <div className="lp-feat-footer">
                      <div>
                        <div className="lp-feat-price">{price}</div>
                        <div className="lp-feat-seats">{seats.toLocaleString()} seats left</div>
                      </div>
                      <button
                        className="lp-btn-black lp-btn-sm"
                        onClick={(e) => { e.stopPropagation(); isReal ? handleBookEvent(ev as Event) : handleStaticBook(); }}
                        disabled={badge === "SOLD OUT"}
                      >
                        {badge === "SOLD OUT" ? "Sold Out" : "Book Now"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="lp-featured-cta">
            <button className="lp-btn-black lp-btn-xl" onClick={handleBrowseAll}>
              Browse All Events →
            </button>
          </div>
        </div>
      </section>

      {/* ══ BOOKING FLOW ═════════════════════════════ */}
      <section className="lp-flow" id="how">
        <div className="lp-section-inner">
          <div className="lp-section-tag lp-tag-light">How It Works</div>
          <h2 className="lp-section-h2 lp-h2-light">From browse to booked<br />in under 60 seconds.</h2>
          <div className="lp-flow-steps">

            <div className="lp-flow-step">
              <div className="lp-flow-num" style={{ borderColor: "#b7c6c2", color: "#b7c6c2" }}>01</div>
              <div className="lp-flow-icon"></div>
              <h3>Select Tickets</h3>
              <p>Choose your ticket type — VIP, General, Early Bird. See real-time seat counts update live.</p>
              <div className="lp-flow-demo lp-demo-tickets">
                {[{ t: "VIP Lounge", p: "₹3,999", s: 23, c: "#ffe17c" }, { t: "General", p: "₹1,499", s: 142, c: "#b7c6c2" }, { t: "Early Bird", p: "₹999", s: 0, c: "#fff" }].map(tk => (
                  <div key={tk.t} className="lp-demo-ticket" style={{ background: tk.c, opacity: tk.s === 0 ? 0.4 : 1 }}>
                    <span>{tk.t}</span>
                    <span>{tk.s === 0 ? "SOLD OUT" : `${tk.s} left`}</span>
                    <span className="lp-demo-price">{tk.p}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lp-flow-connector">→</div>

            <div className="lp-flow-step">
              <div className="lp-flow-num" style={{ borderColor: "#ffe17c", color: "#ffe17c" }}>02</div>
              <div className="lp-flow-icon">⏱</div>
              <h3>Reserve (15 min hold)</h3>
              <p>Your seats are locked for 15 minutes. Complete payment before the timer runs out.</p>
              <ReservationTimer />
            </div>

            <div className="lp-flow-connector">→</div>

            <div className="lp-flow-step">
              <div className="lp-flow-num" style={{ borderColor: "#fff", color: "#fff" }}>03</div>
              <div className="lp-flow-icon"></div>
              <h3>Confirm Booking</h3>
              <p>Pay securely via Card, UPI, or PayPal. Tickets appear instantly in your dashboard.</p>
              <div className="lp-flow-demo lp-demo-confirm">
                <div className="lp-demo-confirm-icon">✓</div>
                <div className="lp-demo-confirm-text">
                  <strong>Booking Confirmed!</strong>
                  <span>2× General · ₹2,998</span>
                  <span>#BK7F3A2E</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══ PROBLEM vs SOLUTION ══════════════════════ */}
      <section className="lp-pvs">
        <div className="lp-section-inner">
          <h2 className="lp-section-h2">Why organizers switch.</h2>
          <div className="lp-pvs-grid">
            <div className="lp-pvs-problem">
              <div className="lp-pvs-label">❌ The Old Way</div>
              {["Missed bookings from slow systems", "Oversold seats & angry customers", "Hidden fees eating 15–30% revenue", "No real-time availability data", "Tickets lost in email threads", "Support takes 3 business days"].map(t => (
                <div key={t} className="lp-pvs-row"><span className="lp-x">✕</span>{t}</div>
              ))}
            </div>
            <div className="lp-pvs-solution">
              <div className="lp-pvs-label">✅ EventHub</div>
              {["Atomic seat locking — zero overselling", "Real-time availability on every page", "0% fee on free events, fair pricing", "Live analytics dashboard included", "Digital tickets in customer dashboard", "24/7 live chat support"].map(t => (
                <div key={t} className="lp-pvs-row"><span className="lp-check">✓</span>{t}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ ORGANIZER SECTION ════════════════════════ */}
      <section className="lp-organizer">
        <div className="lp-dot-bg" />
        <div className="lp-section-inner lp-org-inner">
          <div className="lp-org-left">
            <div className="lp-section-tag">For Organizers</div>
            <h2 className="lp-section-h2">Create &amp; manage<br />events easily.</h2>
            <p className="lp-org-sub">Set up ticket tiers, track sales in real-time, and publish your event in under 10 minutes. No technical skills needed.</p>
            <ul className="lp-org-list">
              {["Unlimited ticket categories (VIP, Regular, Early Bird)", "Real-time sales dashboard with revenue tracking", "Automatic seat release on expired reservations", "Publish instantly or schedule for later"].map(f => (
                <li key={f}><span className="lp-check">✓</span>{f}</li>
              ))}
            </ul>
            <button className="lp-btn-black lp-btn-xl" onClick={() => navigate("/register")}>
              Start Hosting →
            </button>
          </div>

          <div className="lp-org-right">
            <div className="lp-org-dashboard">
              <div className="lp-org-dash-header">
                <span className="lp-org-dash-title">My Events Dashboard</span>
                <span className="lp-org-dash-live">● Live</span>
              </div>
              <div className="lp-org-dash-stats">
                <div className="lp-org-stat"><div className="lp-org-stat-val">₹2.4L</div><div className="lp-org-stat-label">Revenue</div></div>
                <div className="lp-org-stat lp-org-stat-sage"><div className="lp-org-stat-val">1,847</div><div className="lp-org-stat-label">Tickets Sold</div></div>
                <div className="lp-org-stat"><div className="lp-org-stat-val">94%</div><div className="lp-org-stat-label">Fill Rate</div></div>
              </div>
              <div className="lp-org-tiers">
                <div className="lp-org-tier-label">TICKET CATEGORIES</div>
                {[{ name: "VIP Lounge", price: "₹3,999", sold: 77, total: 100 }, { name: "General Admission", price: "₹1,499", sold: 858, total: 1000 }, { name: "Early Bird", price: "₹999", sold: 200, total: 200 }].map(tier => (
                  <div key={tier.name} className="lp-org-tier">
                    <div className="lp-org-tier-info">
                      <span>{tier.name}</span>
                      <span className="lp-org-tier-price">{tier.price}</span>
                    </div>
                    <div className="lp-org-tier-bar-wrap">
                      <div className="lp-org-tier-bar" style={{ width: `${(tier.sold / tier.total) * 100}%`, background: tier.sold === tier.total ? "#ff4444" : "#ffe17c" }} />
                    </div>
                    <div className="lp-org-tier-count">{tier.sold}/{tier.total}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ═════════════════════════════ */}
      <section className="lp-testi">
        <div className="lp-section-inner">
          <div className="lp-section-tag">Testimonials</div>
          <h2 className="lp-section-h2">Trusted by thousands.</h2>
          <div className="lp-testi-grid">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="lp-testi-card">
                <div className="lp-testi-stars">{"★".repeat(t.stars)}</div>
                <p className="lp-testi-text">"{t.text}"</p>
                <div className="lp-testi-author">
                  <div className="lp-testi-avatar">{t.name[0]}</div>
                  <div>
                    <div className="lp-testi-name">{t.name}</div>
                    <div className="lp-testi-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ════════════════════════════════ */}
      <section className="lp-cta">
        <div className="lp-dot-bg" />
        <div className="lp-section-inner lp-cta-inner">
          <div className="lp-cta-tag">Ready?</div>
          <h2 className="lp-cta-h2">Book your next event.<br /><span className="lp-outline">Right now.</span></h2>
          <p className="lp-cta-sub">Join 2 million ticket buyers and 10,000 organizers on EventHub.</p>
          <div className="lp-cta-btns">
            <button className="lp-btn-black lp-btn-xl" onClick={handleBrowseAll}>Explore Events →</button>
            <button className="lp-btn-white lp-btn-xl" onClick={() => navigate("/register")}>Host an Event</button>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ═══════════════════════════════════ */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-brand">
            <div className="lp-logo" style={{ color: "#fff" }}>
              <div className="lp-logo-box">⚡</div>
              <span>EventHub</span>
            </div>
            <p>The modern ticketing platform for events of every size.</p>
            <div className="lp-footer-socials">
              {["𝕏", "in", "gh", "yt"].map(s => <a key={s} className="lp-social" href="#">{s}</a>)}
            </div>
          </div>
          {[
            { title: "Product", links: ["Browse Events", "Create Event", "Pricing", "Changelog"] },
            { title: "Company", links: ["About", "Blog", "Careers", "Press"] },
            { title: "Support", links: ["Help Center", "Contact", "Status", "API Docs"] },
            { title: "Legal", links: ["Privacy", "Terms", "Security", "Cookies"] },
          ].map(col => (
            <div key={col.title} className="lp-footer-col">
              <div className="lp-footer-col-title">{col.title}</div>
              {col.links.map(l => <a key={l} href="#">{l}</a>)}
            </div>
          ))}
        </div>
        <div className="lp-footer-bottom">
          <span>© 2026 EventHub. All rights reserved.</span>
          <span>Made with ⚡ in Mumbai</span>
        </div>
      </footer>

    </div>
  );
}
