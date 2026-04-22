import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { bookingAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import type { Booking, BookingStatus, Event, TicketCategory } from "../types";
import "../styles/MyBookings.css";

const getEntityId = (entity: { id?: string; _id?: string }) => entity.id ?? entity._id ?? "";

const getErrorMessage = (error: unknown, fallback: string) =>
  axios.isAxiosError<{ message?: string; error?: string }>(error)
    ? error.response?.data?.message ?? error.response?.data?.error ?? fallback
    : fallback;

const STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; color: string; emoji: string }
> = {
  reserved: { label: "Reserved", color: "status-reserved", emoji: "" },
  paid: { label: "Paid", color: "status-paid", emoji: "" },
  confirmed: { label: "Confirmed", color: "status-confirmed", emoji: "" },
  expired: { label: "Expired", color: "status-expired", emoji: "" },
  cancelled: { label: "Cancelled", color: "status-cancelled", emoji: "" },
};

export default function MyBookings() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<BookingStatus | "all">("all");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await bookingAPI.getCustomerBookings(user.userId);
      setBookings(data.bookings || []);
    } catch {
      setError("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchBookings();
  }, [fetchBookings, navigate, user]);

  const handleCancel = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    setCancellingId(bookingId);
    try {
      await bookingAPI.cancelBooking(bookingId);
      setBookings((prev) =>
        prev.map((b) =>
          getEntityId(b) === bookingId ? { ...b, status: "cancelled" } : b
        )
      );
    } catch (error: unknown) {
      alert(getErrorMessage(error, "Failed to cancel booking"));
    } finally {
      setCancellingId(null);
    }
  };

  const getEventTitle = (booking: Booking): string => {
    if (typeof booking.eventId === "object" && booking.eventId !== null) {
      return (booking.eventId as Event).title;
    }
    return "Event";
  };

  const getEventDate = (booking: Booking): string => {
    if (typeof booking.eventId === "object" && booking.eventId !== null) {
      return new Date((booking.eventId as Event).date).toLocaleDateString(
        "en-US",
        { weekday: "short", month: "short", day: "numeric", year: "numeric" }
      );
    }
    return "";
  };

  const getTicketName = (booking: Booking): string => {
    if (
      typeof booking.ticketCategoryId === "object" &&
      booking.ticketCategoryId !== null
    ) {
      return (booking.ticketCategoryId as TicketCategory).title;
    }
    return "Ticket";
  };

  const getTimeLeft = (expiresAt: string): string => {
    const remaining = Math.max(
      0,
      Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)
    );
    if (remaining === 0) return "Expired";
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    return `${m}m ${s}s`;
  };

  const filtered =
    filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Loading your bookings...</p>
      </div>
    );
  }

  return (
    <div className="my-bookings-page">
      <div className="my-bookings-container">
        <div className="bookings-header">
          <div>
            <h1>My Bookings</h1>
            <p className="subtitle">
              {bookings.length} booking{bookings.length !== 1 ? "s" : ""} total
            </p>
          </div>
          <button onClick={() => navigate("/#featured")} className="btn-browse">
            + Book More
          </button>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {/* Filter Tabs */}
        {bookings.length > 0 && (
          <div className="filter-tabs">
            {(
              [
                "all",
                "reserved",
                "confirmed",
                "expired",
                "cancelled",
              ] as const
            ).map((f) => (
              <button
                key={f}
                className={`filter-tab ${filter === f ? "active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "All" : STATUS_CONFIG[f].label}
                <span className="filter-count">
                  {f === "all"
                    ? bookings.length
                    : bookings.filter((b) => b.status === f).length}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Bookings List */}
        {filtered.length === 0 ? (
          <div className="no-bookings">
            <div className="no-bookings-icon"></div>
            <h3>
              {filter === "all" ? "No bookings yet" : `No ${filter} bookings`}
            </h3>
            <p>
              {filter === "all"
                ? "Browse events and book your first ticket!"
                : "Try a different filter."}
            </p>
            {filter === "all" && (
              <button onClick={() => navigate("/")} className="btn-browse">
                Browse Events
              </button>
            )}
          </div>
        ) : (
          <div className="bookings-list">
            {filtered.map((booking) => {
              const statusCfg = STATUS_CONFIG[booking.status];
              const bookingId = getEntityId(booking);
              const eventId =
                typeof booking.eventId === "object"
                  ? getEntityId(booking.eventId)
                  : booking.eventId;
              return (
                <div key={bookingId} className="booking-card-item">
                  <div className="booking-card-left">
                    <div className="booking-event-title">
                      {getEventTitle(booking)}
                    </div>
                    {getEventDate(booking) && (
                      <div className="booking-event-date">
                         {getEventDate(booking)}
                      </div>
                    )}
                    <div className="booking-ticket-info">
                       {getTicketName(booking)} × {booking.quantity}
                    </div>
                    <div className="booking-id-text">
                      ID: #{bookingId.slice(-8).toUpperCase()}
                    </div>
                  </div>

                  <div className="booking-card-right">
                    <span className={`booking-status ${statusCfg.color}`}>
                      {statusCfg.label}
                    </span>
                    <div className="booking-amount">
                      ₹{booking.totalAmount.toLocaleString()}
                    </div>

                    {booking.status === "reserved" && (
                      <div className="booking-timer">
                         {getTimeLeft(booking.expiresAt)}
                      </div>
                    )}

                    <div className="booking-actions">
                      {booking.status === "reserved" && (
                        <>
                          <button
                            className="btn-pay"
                            onClick={() => navigate(`/events/${eventId}`)}
                          >
                            Pay Now
                          </button>
                          <button
                            className="btn-cancel"
                            onClick={() => handleCancel(bookingId)}
                            disabled={cancellingId === bookingId}
                          >
                            {cancellingId === bookingId
                              ? "Cancelling..."
                              : "Cancel"}
                          </button>
                        </>
                      )}
                      {booking.status === "expired" && (
                        <button
                          className="btn-rebook"
                          onClick={() => navigate(`/events/${eventId}`)}
                        >
                          Book Again
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
