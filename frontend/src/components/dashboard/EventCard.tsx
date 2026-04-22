import { useState } from "react";
import type { TicketCategory } from "../../types";
import type { MockEvent } from "../../data/mockEvents";

interface Props {
  event: MockEvent;
  onStartBooking: (event: MockEvent, category: TicketCategory) => void;
}

const NB: React.CSSProperties = { fontFamily: "'Space Grotesk','Inter',sans-serif" };

export default function EventCard({ event, onStartBooking }: Props) {
  const [expanded, setExpanded] = useState(false);

  const minPrice       = event.ticketCategories ? Math.min(...event.ticketCategories.map((c) => c.price)) : 0;
  const totalAvailable = event.ticketCategories ? event.ticketCategories.reduce((s, c) => s + c.availableSeats, 0) : 0;
  const totalSeats     = event.ticketCategories ? event.ticketCategories.reduce((s, c) => s + c.totalSeats, 0) : 0;
  const soldPct        = totalSeats > 0 ? ((totalSeats - totalAvailable) / totalSeats) * 100 : 0;

  const avail =
    totalAvailable === 0
      ? { text: "SOLD OUT",     bg: "#171e19", color: "#fff" }
      : soldPct >= 80
      ? { text: "SELLING FAST", bg: "#ff6b35", color: "#fff" }
      : { text: "AVAILABLE",    bg: "#fff",    color: "#000" };

  const dateObj = new Date(event.date);

  return (
    <div style={{ ...NB, background: "#fff", border: "2px solid #000", boxShadow: "4px 4px 0 #000", overflow: "hidden", transition: "transform 0.12s ease, box-shadow 0.12s ease", cursor: "pointer" }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translate(-2px,-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "6px 6px 0 #000"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "4px 4px 0 #000"; }}
    >
      {/* Banner */}
      <div style={{ height: 120, background: event.imageGradient.includes("purple") ? "#b7c6c2" : event.imageGradient.includes("cyan") ? "#171e19" : event.imageGradient.includes("green") ? "#ffe17c" : "#171e19", borderBottom: "2px solid #000", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 12 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {event.tags.slice(0, 2).map((tag) => (
            <span key={tag} style={{ fontSize: "0.65rem", fontWeight: 800, background: "#000", color: "#ffe17c", padding: "2px 8px", border: "1px solid #000", textTransform: "uppercase", letterSpacing: "0.06em" }}>{tag}</span>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.65rem", fontWeight: 800, background: avail.bg, color: avail.color, padding: "3px 10px", border: "2px solid #000", textTransform: "uppercase", letterSpacing: "0.06em" }}>{avail.text}</span>
          {event.popularity >= 90 && (
            <span style={{ fontSize: "0.65rem", fontWeight: 800, background: "#ffe17c", color: "#000", padding: "3px 10px", border: "2px solid #000", textTransform: "uppercase", letterSpacing: "0.06em" }}>🔥 TRENDING</span>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: 16 }}>
        <h3 style={{ fontWeight: 800, fontSize: "0.95rem", lineHeight: 1.3, marginBottom: 10, letterSpacing: "-0.01em", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {event.title}
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#444" }}>
            📅 {dateObj.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })} · {dateObj.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
          </span>
          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#444" }}>📍 {event.location}</span>
          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#444" }}>🎫 {totalAvailable.toLocaleString()} seats left</span>
        </div>

        {/* Seat fill bar */}
        <div style={{ height: 6, background: "#f0f0f0", border: "1px solid #000", marginBottom: 14, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${soldPct}%`, background: soldPct >= 80 ? "#ff6b35" : "#ffe17c", transition: "width 0.3s" }} />
        </div>

        {/* Price + CTA */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#666", marginBottom: 2 }}>From</p>
            <p style={{ fontSize: "1.1rem", fontWeight: 800, letterSpacing: "-0.02em" }}>₹{minPrice.toLocaleString()}</p>
          </div>
          <button onClick={() => setExpanded((e) => !e)}
            style={{ background: "#000", color: "#fff", border: "2px solid #000", padding: "8px 16px", fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer", boxShadow: "3px 3px 0 #555", transition: "transform 0.12s, box-shadow 0.12s", fontFamily: "inherit" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translate(-2px,-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "5px 5px 0 #555"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "3px 3px 0 #555"; }}
          >
            {expanded ? "Hide ↑" : "View →"}
          </button>
        </div>

        {/* Expanded ticket categories */}
        {expanded && event.ticketCategories && (
          <div style={{ marginTop: 16, borderTop: "2px solid #000", paddingTop: 14 }}>
            <p style={{ fontSize: "0.68rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#666", marginBottom: 10 }}>Select Ticket Type</p>
            {event.ticketCategories.map((cat) => (
              <TicketRow key={cat._id} category={cat} onSelect={() => onStartBooking(event, cat)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TicketRow({ category, onSelect }: { category: TicketCategory; onSelect: () => void }) {
  const isSoldOut = category.availableSeats === 0;
  const isLow     = !isSoldOut && category.availableSeats <= 20;

  return (
    <div onClick={!isSoldOut ? onSelect : undefined}
      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", border: "2px solid #000", marginBottom: 8, background: isSoldOut ? "#f5f5f5" : "#fff", opacity: isSoldOut ? 0.5 : 1, cursor: isSoldOut ? "not-allowed" : "pointer", transition: "background 0.12s, transform 0.12s, box-shadow 0.12s" }}
      onMouseEnter={e => { if (!isSoldOut) { (e.currentTarget as HTMLElement).style.background = "#ffe17c"; (e.currentTarget as HTMLElement).style.transform = "translate(-1px,-1px)"; (e.currentTarget as HTMLElement).style.boxShadow = "3px 3px 0 #000"; } }}
      onMouseLeave={e => { if (!isSoldOut) { (e.currentTarget as HTMLElement).style.background = "#fff"; (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "none"; } }}
    >
      <div>
        <p style={{ fontWeight: 800, fontSize: "0.85rem" }}>{category.title}</p>
        <p style={{ fontSize: "0.7rem", color: "#666", textTransform: "capitalize" }}>{category.type.replace("_", " ")}</p>
        {isLow && <p style={{ fontSize: "0.7rem", color: "#ff6b35", fontWeight: 700 }}>Only {category.availableSeats} left!</p>}
      </div>
      <div style={{ textAlign: "right" }}>
        <p style={{ fontWeight: 800, fontSize: "0.95rem" }}>₹{category.price.toLocaleString()}</p>
        <p style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: isSoldOut ? "#ff4444" : "#000" }}>
          {isSoldOut ? "Sold Out" : "Select →"}
        </p>
      </div>
    </div>
  );
}
