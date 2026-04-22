import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { MOCK_BOOKINGS } from "../../data/mockEvents";
import type { BookingStatus } from "../../types";
import type { MockEvent } from "../../data/mockEvents";
import type { TicketCategory } from "../../types";

type MockBooking = {
  _id: string; customerId: string; eventId: MockEvent; ticketCategoryId: TicketCategory;
  quantity: number; totalAmount: number; status: BookingStatus;
  reservedAt: string; expiresAt: string; paidAt?: string; confirmedAt?: string; cancelledAt?: string;
};

const STATUS: Record<BookingStatus, { label: string; bg: string; color: string; border: string }> = {
  reserved:  { label: "RESERVED",  bg: "#ffe17c", color: "#000",    border: "#000" },
  paid:      { label: "PAID",      bg: "#b7c6c2", color: "#000",    border: "#000" },
  confirmed: { label: "CONFIRMED", bg: "#000",    color: "#ffe17c", border: "#000" },
  expired:   { label: "EXPIRED",   bg: "#f0f0f0", color: "#666",    border: "#999" },
  cancelled: { label: "CANCELLED", bg: "#ff4444", color: "#fff",    border: "#000" },
};

type FilterTab = BookingStatus | "all";
const NB: React.CSSProperties = { fontFamily: "'Space Grotesk','Inter',sans-serif" };

export default function MyBookingsList() {
  const [filter, setFilter]   = useState<FilterTab>("all");
  const [bookings, setBookings] = useState<MockBooking[]>(MOCK_BOOKINGS);
  const [timers, setTimers]   = useState<Record<string, number>>({});

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const updated: Record<string, number> = {};
      bookings.forEach((b) => {
        if (b.status === "reserved") updated[b._id] = Math.max(0, Math.floor((new Date(b.expiresAt).getTime() - now) / 1000));
      });
      setTimers(updated);
    }, 1000);
    return () => clearInterval(interval);
  }, [bookings]);

  const handleCancel = (id: string) => {
    if (!confirm("Cancel this booking?")) return;
    setBookings((prev) => prev.map((b) => b._id === id ? { ...b, status: "cancelled" as BookingStatus } : b));
  };

  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);
  const counts: Record<FilterTab, number> = {
    all: bookings.length,
    reserved: bookings.filter((b) => b.status === "reserved").length,
    paid: bookings.filter((b) => b.status === "paid").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    expired: bookings.filter((b) => b.status === "expired").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };

  const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div style={NB}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>My Bookings</h1>
          <p style={{ fontSize: "0.82rem", color: "#666", marginTop: 4, fontWeight: 600 }}>{bookings.length} total bookings</p>
        </div>
        <button onClick={() => setBookings(MOCK_BOOKINGS)}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "2px solid #000", padding: "8px 14px", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer", boxShadow: "3px 3px 0 #000", transition: "transform 0.12s, box-shadow 0.12s", fontFamily: "inherit" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translate(-2px,-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "5px 5px 0 #000"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "3px 3px 0 #000"; }}
        >
          <RefreshCw style={{ width: 12, height: 12 }} /> Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 0, border: "2px solid #000", boxShadow: "3px 3px 0 #000", marginBottom: 24, flexWrap: "wrap" }}>
        {(["all", "reserved", "confirmed", "expired", "cancelled"] as FilterTab[]).map((tab, i, arr) => (
          <button key={tab} onClick={() => setFilter(tab)}
            style={{ padding: "9px 14px", background: filter === tab ? "#ffe17c" : "#fff", border: "none", borderRight: i < arr.length - 1 ? "2px solid #000" : "none", fontWeight: 700, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6, transition: "background 0.12s" }}
            onMouseEnter={e => { if (filter !== tab) (e.currentTarget as HTMLElement).style.background = "#f5f5f5"; }}
            onMouseLeave={e => { if (filter !== tab) (e.currentTarget as HTMLElement).style.background = "#fff"; }}
          >
            {tab === "all" ? "All" : STATUS[tab as BookingStatus].label}
            <span style={{ background: filter === tab ? "#000" : "#f0f0f0", color: filter === tab ? "#ffe17c" : "#666", padding: "1px 6px", fontSize: "0.65rem", fontWeight: 800 }}>{counts[tab]}</span>
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", border: "2px solid #000", background: "#f5f5f5" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎫</div>
          <h3 style={{ fontWeight: 800, fontSize: "1.1rem", marginBottom: 8 }}>No bookings found</h3>
          <p style={{ fontSize: "0.85rem", color: "#666" }}>{filter === "all" ? "You haven't booked any events yet." : `No ${filter} bookings.`}</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {filtered.map((booking) => {
            const ev  = booking.eventId as MockEvent;
            const cat = booking.ticketCategoryId as TicketCategory;
            const st  = STATUS[booking.status];
            const timer = timers[booking._id];
            const isLow = timer !== undefined && timer < 120;

            return (
              <div key={booking._id} style={{ background: "#fff", border: "2px solid #000", boxShadow: "4px 4px 0 #000", overflow: "hidden", transition: "transform 0.12s, box-shadow 0.12s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translate(-2px,-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "6px 6px 0 #000"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "4px 4px 0 #000"; }}
              >
                {/* Top accent bar */}
                <div style={{ height: 4, background: st.bg, borderBottom: "2px solid #000" }} />

                <div style={{ padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                  {/* Left */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: "0.65rem", fontWeight: 800, background: st.bg, color: st.color, padding: "3px 10px", border: `2px solid ${st.border}`, textTransform: "uppercase", letterSpacing: "0.06em" }}>{st.label}</span>
                      {booking.status === "reserved" && timer !== undefined && (
                        <span style={{ fontSize: "0.65rem", fontWeight: 800, background: isLow ? "#ff4444" : "#ffe17c", color: isLow ? "#fff" : "#000", padding: "3px 10px", border: "2px solid #000", fontFamily: "'Courier New', monospace" }}>⏱ {fmt(timer)}</span>
                      )}
                    </div>
                    <h3 style={{ fontWeight: 800, fontSize: "1rem", marginBottom: 8, letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.title}</h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px", fontSize: "0.75rem", fontWeight: 600, color: "#555" }}>
                      <span>📅 {new Date(ev.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                      <span>📍 {ev.location}</span>
                      <span>🎫 {cat.title} × {booking.quantity}</span>
                    </div>
                  </div>

                  {/* Right */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#666", marginBottom: 4 }}>Total Paid</p>
                    <p style={{ fontSize: "1.4rem", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 4 }}>₹{booking.totalAmount.toLocaleString()}</p>
                    <p style={{ fontSize: "0.65rem", fontFamily: "'Courier New', monospace", color: "#999" }}>#{booking._id.slice(-8).toUpperCase()}</p>

                    <div style={{ display: "flex", gap: 8, marginTop: 10, justifyContent: "flex-end" }}>
                      {booking.status === "reserved" && (
                        <>
                          <ActionBtn label="Pay Now" primary onClick={() => {}} />
                          <ActionBtn label="Cancel" danger onClick={() => handleCancel(booking._id)} />
                        </>
                      )}
                      {booking.status === "confirmed" && <ActionBtn label="Download" onClick={() => {}} />}
                      {booking.status === "expired"   && <ActionBtn label="Book Again" onClick={() => {}} />}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ActionBtn({ label, onClick, primary, danger }: { label: string; onClick: () => void; primary?: boolean; danger?: boolean }) {
  const bg    = primary ? "#000" : danger ? "#ff4444" : "#fff";
  const color = primary ? "#ffe17c" : danger ? "#fff" : "#000";
  return (
    <button onClick={onClick}
      style={{ background: bg, color, border: "2px solid #000", padding: "6px 14px", fontWeight: 700, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer", boxShadow: "2px 2px 0 #555", transition: "transform 0.12s, box-shadow 0.12s", fontFamily: "'Space Grotesk','Inter',sans-serif" }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translate(-1px,-1px)"; (e.currentTarget as HTMLElement).style.boxShadow = "3px 3px 0 #555"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "2px 2px 0 #555"; }}
    >
      {label}
    </button>
  );
}
