import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { eventAPI, eventsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import type { Event } from "../types";
import "../styles/MyEvents.css";

const getEntityId = (entity: { id?: string; _id?: string }) => entity.id ?? entity._id ?? "";

const getErrorMessage = (error: unknown, fallback: string) =>
  axios.isAxiosError<{ message?: string; error?: string }>(error)
    ? error.response?.data?.message ?? error.response?.data?.error ?? fallback
    : fallback;

export default function MyEvents() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await eventAPI.getOrganizerEvents(user.userId);
      setEvents(data.events || []);
    } catch {
      setError("Failed to load your events");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "organizer" && user.role !== "admin") {
      navigate("/");
      return;
    }
    fetchEvents();
  }, [fetchEvents, navigate, user]);

  const handlePublish = async (eventId: string) => {
    setPublishingId(eventId);
    try {
      await eventsAPI.publish(eventId);
      setEvents((prev) =>
        prev.map((e) =>
          getEntityId(e) === eventId
            ? { ...e, status: "published" as const }
            : e
        )
      );
    } catch (error: unknown) {
      alert(getErrorMessage(error, "Failed to publish event"));
    } finally {
      setPublishingId(null);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    setDeletingId(eventId);
    try {
      await eventsAPI.delete(eventId);
      setEvents((prev) =>
        prev.filter((e) => getEntityId(e) !== eventId)
      );
    } catch (error: unknown) {
      alert(getErrorMessage(error, "Failed to delete event"));
    } finally {
      setDeletingId(null);
    }
  };

  const getEventId = (event: Event) => getEntityId(event);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Loading your events...</p>
      </div>
    );
  }

  return (
    <div className="my-events-page">
      <div className="my-events-container">
        <div className="my-events-header">
          <div>
            <h1>My Events</h1>
            <p className="subtitle">
              {events.length} event{events.length !== 1 ? "s" : ""} created
            </p>
          </div>
          <button
            onClick={() => navigate("/events/create")}
            className="btn-create"
          >
            + Create Event
          </button>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {events.length === 0 ? (
          <div className="no-events-card">
            <div className="no-events-icon"></div>
            <h3>No events yet</h3>
            <p>Create your first event and start selling tickets!</p>
            <button
              onClick={() => navigate("/events/create")}
              className="btn-create"
            >
              Create Your First Event
            </button>
          </div>
        ) : (
          <div className="events-list">
            {events.map((event) => {
              const eventId = getEventId(event);
              const ticketCount = event.ticketCategories?.length || 0;
              const totalSeats =
                event.ticketCategories?.reduce(
                  (sum, cat) => sum + cat.totalSeats,
                  0
                ) || 0;
              const availableSeats =
                event.ticketCategories?.reduce(
                  (sum, cat) => sum + cat.availableSeats,
                  0
                ) || 0;

              return (
                <div key={eventId} className="event-list-card">
                  <div className="event-list-main">
                    <div className="event-list-info">
                      <h3>{event.title}</h3>
                      <p className="event-list-desc">{event.description}</p>
                      <div className="event-list-meta">
                        <span>{new Date(event.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</span>
                        <span>{event.location}</span>
                        {ticketCount > 0 && (
                          <span>{ticketCount} categor{ticketCount !== 1 ? "ies" : "y"} · {availableSeats}/{totalSeats} seats</span>
                        )}
                      </div>
                    </div>

                    <div className="event-list-right">
                      <span className={`event-status-badge status-${event.status}`}>
                        {event.status}
                      </span>

                      <div className="event-list-actions">
                        <button
                          className="btn-view-event"
                          onClick={() => navigate(`/events/${eventId}`)}
                        >
                          View
                        </button>

                        {event.status === "draft" && (
                          <button
                            className="btn-publish"
                            onClick={() => handlePublish(eventId)}
                            disabled={publishingId === eventId}
                          >
                            {publishingId === eventId ? "Publishing..." : "Publish"}
                          </button>
                        )}

                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(eventId)}
                          disabled={deletingId === eventId}
                        >
                          {deletingId === eventId ? "..." : "Delete"}
                        </button>
                      </div>
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
