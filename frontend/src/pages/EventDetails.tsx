import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { eventAPI } from "../services/api";
import { bookingAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import type { Event, TicketCategory, Booking, PaymentMethod } from "../types";
import "../styles/EventDetails.css";

type BookingStep = "select" | "payment" | "success";

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Booking state
  const [bookingStep, setBookingStep] = useState<BookingStep>("select");
  const [selectedCategory, setSelectedCategory] =
    useState<TicketCategory | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const fetchEvent = useCallback(async () => {
    if (!id) return;
    try {
      const data = await eventAPI.getEventById(id);
      setEvent(data.event);
    } catch {
      setError("Failed to load event details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  // Countdown timer for reserved booking
  useEffect(() => {
    if (!booking || booking.status !== "reserved") return;
    const interval = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.floor((new Date(booking.expiresAt).getTime() - Date.now()) / 1000)
      );
      setTimeLeft(remaining);
      if (remaining === 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [booking]);

  const handleCreateBooking = async () => {
    if (!selectedCategory || !user) return;
    setBookingLoading(true);
    setBookingError("");
    try {
      const result = await bookingAPI.createBooking(
        id!,
        selectedCategory._id,
        quantity
      );
      setBooking(result.booking);
      setBookingStep("payment");
    } catch (err: any) {
      setBookingError(
        err.response?.data?.message || "Failed to create booking"
      );
    } finally {
      setBookingLoading(false);
    }
  };

  const handleProcessPayment = async () => {
    if (!booking) return;
    setBookingLoading(true);
    setBookingError("");
    try {
      const result = await bookingAPI.processPayment(
        booking._id,
        paymentMethod
      );
      setBooking(result.booking);
      setBookingStep("success");
    } catch (err: any) {
      setBookingError(err.response?.data?.message || "Payment failed");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!booking) return;
    setBookingLoading(true);
    try {
      await bookingAPI.cancelBooking(booking._id);
      setBooking(null);
      setBookingStep("select");
      setSelectedCategory(null);
      setQuantity(1);
      fetchEvent(); // refresh seat counts
    } catch (err: any) {
      setBookingError(err.response?.data?.message || "Failed to cancel");
    } finally {
      setBookingLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const totalAmount = selectedCategory
    ? selectedCategory.price * quantity
    : 0;

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Loading event details...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="error-container">
        <h2>Event Not Found</h2>
        <p>{error || "This event does not exist"}</p>
        <button onClick={() => navigate("/")} className="btn-back">
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="event-details-page">
      <div className="event-details-container">
        <button onClick={() => navigate("/")} className="btn-back-small">
          ← Back to Events
        </button>

        {/* Event Header */}
        <div className="event-header">
          <div className="event-header-content">
            <h1>{event.title}</h1>
            <div className="event-meta">
              <span className={`event-status status-${event.status}`}>
                {event.status}
              </span>
            </div>
          </div>
        </div>

        {/* Event Content */}
        <div className="event-content">
          {/* Left Column */}
          <div className="event-info">
            <div className="info-card">
              <h3>About This Event</h3>
              <p>{event.description}</p>
            </div>

            <div className="info-card">
              <h3>Event Details</h3>
              <div className="detail-item">
                <span className="detail-icon"></span>
                <div>
                  <strong>Date</strong>
                  <p>
                    {new Date(event.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="detail-item">
                <span className="detail-icon"></span>
                <div>
                  <strong>Time</strong>
                  <p>
                    {new Date(event.date).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              <div className="detail-item">
                <span className="detail-icon"></span>
                <div>
                  <strong>Location</strong>
                  <p>{event.location}</p>
                </div>
              </div>
            </div>

            {/* Ticket Categories */}
            {event.ticketCategories && event.ticketCategories.length > 0 && (
              <div className="info-card">
                <h3>Ticket Categories</h3>
                <div className="ticket-categories">
                  {event.ticketCategories.map((cat) => (
                    <div
                      key={cat._id}
                      className={`ticket-category-card ${selectedCategory?._id === cat._id ? "selected" : ""} ${cat.availableSeats === 0 ? "sold-out" : ""}`}
                      onClick={() => {
                        if (cat.availableSeats > 0 && bookingStep === "select") {
                          setSelectedCategory(cat);
                          setQuantity(1);
                        }
                      }}
                    >
                      <div className="ticket-cat-info">
                        <span className="ticket-cat-name">{cat.title}</span>
                        <span className="ticket-cat-type">{cat.type}</span>
                      </div>
                      <div className="ticket-cat-right">
                        <span className="ticket-cat-price">
                          ₹{cat.price.toLocaleString()}
                        </span>
                        <span
                          className={`ticket-cat-seats ${cat.availableSeats < 10 ? "low" : ""}`}
                        >
                          {cat.availableSeats === 0
                            ? "Sold Out"
                            : `${cat.availableSeats} left`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Booking Card */}
          <div className="booking-sidebar">
            {/* Booking Step: Select */}
            {bookingStep === "select" && (
              <div className="booking-card">
                <h3>Book Your Spot</h3>

                {!user ? (
                  <>
                    <p className="booking-info">
                      Please login to book this event
                    </p>
                    <button
                      className="btn-book"
                      onClick={() => navigate("/login")}
                    >
                      Login to Book
                    </button>
                  </>
                ) : user.role !== "customer" ? (
                  <p className="booking-info organizer-note">
                    You are viewing as an organizer
                  </p>
                ) : !event.ticketCategories ||
                  event.ticketCategories.length === 0 ? (
                  <p className="booking-info">
                    No tickets available for this event yet.
                  </p>
                ) : (
                  <>
                    {selectedCategory ? (
                      <>
                        <div className="selected-ticket">
                          <p className="selected-label">Selected Ticket</p>
                          <p className="selected-name">
                            {selectedCategory.title}
                          </p>
                          <p className="selected-price">
                            ₹{selectedCategory.price.toLocaleString()} / ticket
                          </p>
                        </div>

                        <div className="quantity-selector">
                          <label>Quantity</label>
                          <div className="qty-controls">
                            <button
                              onClick={() =>
                                setQuantity((q) => Math.max(1, q - 1))
                              }
                              className="qty-btn"
                            >
                              −
                            </button>
                            <span className="qty-value">{quantity}</span>
                            <button
                              onClick={() =>
                                setQuantity((q) =>
                                  Math.min(
                                    selectedCategory.availableSeats,
                                    q + 1
                                  )
                                )
                              }
                              className="qty-btn"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className="booking-total">
                          <span>Total</span>
                          <span className="total-amount">
                            ₹{totalAmount.toLocaleString()}
                          </span>
                        </div>

                        {bookingError && (
                          <p className="booking-error">{bookingError}</p>
                        )}

                        <button
                          className="btn-book"
                          onClick={handleCreateBooking}
                          disabled={bookingLoading}
                        >
                          {bookingLoading ? "Reserving..." : "Reserve Now"}
                        </button>
                        <button
                          className="btn-cancel-selection"
                          onClick={() => setSelectedCategory(null)}
                        >
                          Change Ticket
                        </button>
                      </>
                    ) : (
                      <p className="booking-info">
                        ← Select a ticket category to continue
                      </p>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Booking Step: Payment */}
            {bookingStep === "payment" && booking && (
              <div className="booking-card">
                <h3>Complete Payment</h3>

                {timeLeft !== null && (
                  <div
                    className={`timer ${timeLeft < 300 ? "timer-urgent" : ""}`}
                  >
                    <span className="timer-icon"></span>
                    <span>
                      Expires in{" "}
                      <strong>{formatTime(timeLeft)}</strong>
                    </span>
                  </div>
                )}

                <div className="booking-summary">
                  <div className="summary-row">
                    <span>Tickets</span>
                    <span>{booking.quantity}x</span>
                  </div>
                  <div className="summary-row">
                    <span>Amount</span>
                    <span>₹{booking.totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="payment-methods">
                  <label>Payment Method</label>
                  <div className="payment-options">
                    {(["card", "paypal", "upi"] as PaymentMethod[]).map(
                      (method) => (
                        <button
                          key={method}
                          className={`payment-option ${paymentMethod === method ? "active" : ""}`}
                          onClick={() => setPaymentMethod(method)}
                        >
                          <span className="payment-icon">
                          </span>
                          <span>
                            {method === "card"
                              ? "Card"
                              : method === "paypal"
                                ? "PayPal"
                                : "UPI"}
                          </span>
                        </button>
                      )
                    )}
                  </div>
                </div>

                {bookingError && (
                  <p className="booking-error">{bookingError}</p>
                )}

                <button
                  className="btn-book"
                  onClick={handleProcessPayment}
                  disabled={bookingLoading}
                >
                  {bookingLoading
                    ? "Processing..."
                    : `Pay ₹${booking.totalAmount.toLocaleString()}`}
                </button>
                <button
                  className="btn-cancel-selection"
                  onClick={handleCancelBooking}
                  disabled={bookingLoading}
                >
                  Cancel Booking
                </button>
              </div>
            )}

            {/* Booking Step: Success */}
            {bookingStep === "success" && booking && (
              <div className="booking-card booking-success">
                <div className="success-icon"></div>
                <h3>Booking Confirmed!</h3>
                <p className="booking-info">
                  Your booking has been confirmed successfully.
                </p>
                <div className="booking-summary">
                  <div className="summary-row">
                    <span>Booking ID</span>
                    <span className="booking-id">
                      #{booking._id.slice(-8).toUpperCase()}
                    </span>
                  </div>
                  <div className="summary-row">
                    <span>Tickets</span>
                    <span>{booking.quantity}x</span>
                  </div>
                  <div className="summary-row">
                    <span>Amount Paid</span>
                    <span>₹{booking.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="summary-row">
                    <span>Status</span>
                    <span className="status-confirmed">Confirmed</span>
                  </div>
                </div>
                <button
                  className="btn-book"
                  onClick={() => navigate("/bookings")}
                >
                  View My Bookings
                </button>
              </div>
            )}

            {/* Organizer Card */}
            <div className="organizer-card">
              <h4>Organized By</h4>
              <p>Event Organizer</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
