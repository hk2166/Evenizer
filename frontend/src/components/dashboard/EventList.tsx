import { useState } from "react";
import EventCard from "./EventCard";
import type { TicketCategory } from "../../types";
import type { MockEvent } from "../../data/mockEvents";

const CATS = [
  { id: "all",    label: "ALL" },
  { id: "music",  label: "🎵 MUSIC" },
  { id: "tech",   label: "💻 TECH" },
  { id: "sports", label: "🏆 SPORTS" },
  { id: "arts",   label: "🎨 ARTS" },
  { id: "comedy", label: "🎤 COMEDY" },
];

type SortKey = "popularity" | "date" | "price_asc" | "price_desc";

interface Props {
  events: MockEvent[];
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
  onStartBooking: (event: MockEvent, category: TicketCategory) => void;
}

const NB: React.CSSProperties = { fontFamily: "'Space Grotesk','Inter',sans-serif" };

export default function EventList({ events, activeCategory, onCategoryChange, onStartBooking }: Props) {
  const [sortKey, setSortKey]       = useState<SortKey>("popularity");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 20000]);
  const [showFilters, setShowFilters] = useState(false);

  const sorted = [...events]
    .filter((e) => {
      const min = e.ticketCategories ? Math.min(...e.ticketCategories.map((c) => c.price)) : 0;
      return min >= priceRange[0] && min <= priceRange[1];
    })
    .sort((a, b) => {
      if (sortKey === "popularity") return b.popularity - a.popularity;
      if (sortKey === "date") return new Date(a.date).getTime() - new Date(b.date).getTime();
      const aMin = a.ticketCategories ? Math.min(...a.ticketCategories.map((c) => c.price)) : 0;
      const bMin = b.ticketCategories ? Math.min(...b.ticketCategories.map((c) => c.price)) : 0;
      return sortKey === "price_asc" ? aMin - bMin : bMin - aMin;
    });

  return (
    <div style={NB}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>Browse Events</h1>
          <p style={{ fontSize: "0.82rem", color: "#666", marginTop: 4, fontWeight: 600 }}>{sorted.length} events found</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button onClick={() => setShowFilters((f) => !f)}
            style={{ background: showFilters ? "#ffe17c" : "#fff", border: "2px solid #000", padding: "8px 16px", fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer", boxShadow: "3px 3px 0 #000", transition: "transform 0.12s, box-shadow 0.12s", fontFamily: "inherit" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translate(-2px,-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "5px 5px 0 #000"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "3px 3px 0 #000"; }}
          >
            ⚙ Filters
          </button>
          <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}
            style={{ border: "2px solid #000", padding: "8px 12px", fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.04em", cursor: "pointer", background: "#fff", boxShadow: "3px 3px 0 #000", fontFamily: "inherit", outline: "none" }}
          >
            <option value="popularity">🔥 Popularity</option>
            <option value="date">📅 Date</option>
            <option value="price_asc">↑ Price Low→High</option>
            <option value="price_desc">↓ Price High→Low</option>
          </select>
        </div>
      </div>

      {/* Category tabs */}
      <div style={{ display: "flex", gap: 0, border: "2px solid #000", boxShadow: "3px 3px 0 #000", marginBottom: 20, flexWrap: "wrap" }}>
        {CATS.map((cat, i) => (
          <button key={cat.id} onClick={() => onCategoryChange(cat.id)}
            style={{ padding: "9px 16px", background: activeCategory === cat.id ? "#ffe17c" : "#fff", border: "none", borderRight: i < CATS.length - 1 ? "2px solid #000" : "none", fontWeight: 700, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer", fontFamily: "inherit", transition: "background 0.12s" }}
            onMouseEnter={e => { if (activeCategory !== cat.id) (e.currentTarget as HTMLElement).style.background = "#f5f5f5"; }}
            onMouseLeave={e => { if (activeCategory !== cat.id) (e.currentTarget as HTMLElement).style.background = "#fff"; }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div style={{ background: "#fff", border: "2px solid #000", padding: 20, marginBottom: 20, boxShadow: "4px 4px 0 #000" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <p style={{ fontWeight: 800, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Price Range</p>
            <button onClick={() => setPriceRange([0, 20000])} style={{ fontSize: "0.72rem", fontWeight: 700, background: "#ffe17c", border: "2px solid #000", padding: "3px 10px", cursor: "pointer", fontFamily: "inherit" }}>Reset</button>
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            {[["Min", 0], ["Max", 1]].map(([label, idx]) => (
              <div key={String(label)} style={{ flex: 1 }}>
                <label style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>
                  {label} ₹{priceRange[idx as number].toLocaleString()}
                </label>
                <input type="range" min={0} max={20000} step={500} value={priceRange[idx as number]}
                  onChange={(e) => setPriceRange(idx === 0 ? [+e.target.value, priceRange[1]] : [priceRange[0], +e.target.value])}
                  style={{ width: "100%", accentColor: "#000" }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid */}
      {sorted.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", border: "2px solid #000", background: "#f5f5f5" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎪</div>
          <h3 style={{ fontWeight: 800, fontSize: "1.1rem", marginBottom: 8 }}>No events found</h3>
          <p style={{ fontSize: "0.85rem", color: "#666" }}>Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
          {sorted.map((event) => (
            <EventCard key={event.id} event={event} onStartBooking={onStartBooking} />
          ))}
        </div>
      )}
    </div>
  );
}
