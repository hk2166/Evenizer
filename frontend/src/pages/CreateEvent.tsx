import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { eventAPI, eventsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "../styles/CreateEvent.css";

interface TicketCategoryInput {
  title: string;
  price: string;
  type: string;
  totalSeats: string;
}

export default function CreateEvent() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [publishAfter, setPublishAfter] = useState(false);

  const [ticketCategories, setTicketCategories] = useState<
    TicketCategoryInput[]
  >([{ title: "", price: "", type: "regular", totalSeats: "" }]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "organizer" && user.role !== "admin") {
      setError("You don't have permission to create events");
      setTimeout(() => navigate("/"), 2000);
    }
  }, [user, navigate]);

  const addTicketCategory = () => {
    setTicketCategories((prev) => [
      ...prev,
      { title: "", price: "", type: "regular", totalSeats: "" },
    ]);
  };

  const removeTicketCategory = (index: number) => {
    setTicketCategories((prev) => prev.filter((_, i) => i !== index));
  };

  const updateTicketCategory = (
    index: number,
    field: keyof TicketCategoryInput,
    value: string
  ) => {
    setTicketCategories((prev) =>
      prev.map((cat, i) => (i === index ? { ...cat, [field]: value } : cat))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title || !description || !date || !location) {
      setError("Please fill in all required fields");
      return;
    }
    if (!user) return;

    // Validate ticket categories
    const validCategories = ticketCategories.filter(
      (cat) => cat.title && cat.price && cat.totalSeats
    );
    for (const cat of validCategories) {
      if (isNaN(Number(cat.price)) || Number(cat.price) <= 0) {
        setError("Ticket price must be a positive number");
        return;
      }
      if (isNaN(Number(cat.totalSeats)) || Number(cat.totalSeats) <= 0) {
        setError("Total seats must be a positive number");
        return;
      }
    }

    setLoading(true);
    try {
      const response = await eventAPI.createEvent({
        title,
        description,
        date,
        location,
        ticketCategories:
          validCategories.length > 0
            ? validCategories.map((cat) => ({
                title: cat.title,
                price: Number(cat.price),
                type: cat.type,
                totalSeats: Number(cat.totalSeats),
              }))
            : undefined,
      });

      const eventId = response.event.id || response.event._id;

      // Publish if requested
      if (publishAfter && eventId) {
        try {
          await eventsAPI.publish(eventId);
        } catch {
          // ignore publish error, event was created
        }
      }

      navigate(`/events/${eventId}`);
    } catch (error: unknown) {
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      setError(message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-event-page">
      <div className="create-event-container">
        <h1>Create New Event</h1>
        <p className="subtitle">Fill in the details to create your event</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="event-form">
          {/* Basic Info */}
          <div className="form-section">
            <h3 className="form-section-title">Event Information</h3>

            <div className="form-group">
              <label htmlFor="title">Event Title *</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter event title"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your event"
                rows={4}
                disabled={loading}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date">Date & Time *</label>
                <input
                  type="datetime-local"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="location">Location *</label>
                <input
                  type="text"
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter event location"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Ticket Categories */}
          <div className="form-section">
            <div className="section-header">
              <h3 className="form-section-title">Ticket Categories</h3>
              <button
                type="button"
                className="btn-add-ticket"
                onClick={addTicketCategory}
                disabled={loading}
              >
                + Add Category
              </button>
            </div>

            {ticketCategories.map((cat, index) => (
              <div key={index} className="ticket-category-form">
                <div className="ticket-form-header">
                  <span>Category {index + 1}</span>
                  {ticketCategories.length > 1 && (
                    <button
                      type="button"
                      className="btn-remove-ticket"
                      onClick={() => removeTicketCategory(index)}
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Category Name</label>
                    <input
                      type="text"
                      value={cat.title}
                      onChange={(e) =>
                        updateTicketCategory(index, "title", e.target.value)
                      }
                      placeholder="e.g. General, VIP"
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label>Type</label>
                    <select
                      value={cat.type}
                      onChange={(e) =>
                        updateTicketCategory(index, "type", e.target.value)
                      }
                      disabled={loading}
                    >
                      <option value="regular">Regular</option>
                      <option value="vip">VIP</option>
                      <option value="premium">Premium</option>
                      <option value="student">Student</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Price (₹)</label>
                    <input
                      type="number"
                      value={cat.price}
                      onChange={(e) =>
                        updateTicketCategory(index, "price", e.target.value)
                      }
                      placeholder="0"
                      min="0"
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label>Total Seats</label>
                    <input
                      type="number"
                      value={cat.totalSeats}
                      onChange={(e) =>
                        updateTicketCategory(
                          index,
                          "totalSeats",
                          e.target.value
                        )
                      }
                      placeholder="100"
                      min="1"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Publish Option */}
          <div className="form-section">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={publishAfter}
                onChange={(e) => setPublishAfter(e.target.checked)}
                disabled={loading}
              />
              <span>Publish event immediately after creation</span>
            </label>
            <p className="checkbox-hint">
              Published events are visible to customers. You can publish later
              from My Events.
            </p>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "Creating..." : "Create Event"}
          </button>
        </form>
      </div>
    </div>
  );
}
