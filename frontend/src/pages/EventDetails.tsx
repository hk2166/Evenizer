import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Event } from '../types';
import '../styles/EventDetails.css';

export default function EventDetails() {
  // Get event ID from URL parameters
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State management
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch event details when component mounts
  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;

      try {
        const data = await eventAPI.getEventById(id);
        setEvent(data.event);
      } catch (err: any) {
        setError('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  // Loading state
  if (loading) {
    return <div className="loading">Loading event details...</div>;
  }

  // Error state
  if (error || !event) {
    return (
      <div className="error-container">
        <h2>Event Not Found</h2>
        <p>{error || 'This event does not exist'}</p>
        <button onClick={() => navigate('/')} className="btn-back">
          Back to Home
        </button>
      </div>
    );
  }

  // Main render
  return (
    <div className="event-details-page">
      <div className="event-details-container">
        {/* Back button */}
        <button onClick={() => navigate('/')} className="btn-back-small">
          ← Back to Events
        </button>

        {/* Event Header */}
        <div className="event-header">
          <div className="event-header-content">
            <h1>{event.title}</h1>
            <div className="event-meta">
              <span className="event-status">{event.status}</span>
            </div>
          </div>
        </div>

        {/* Event Content */}
        <div className="event-content">
          {/* Left Column - Event Info */}
          <div className="event-info">
            <div className="info-card">
              <h3>About This Event</h3>
              <p>{event.description}</p>
            </div>

            <div className="info-card">
              <h3>Event Details</h3>
              <div className="detail-item">
                <span className="detail-icon">📅</span>
                <div>
                  <strong>Date</strong>
                  <p>{new Date(event.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</p>
                </div>
              </div>

              <div className="detail-item">
                <span className="detail-icon">🕐</span>
                <div>
                  <strong>Time</strong>
                  <p>{new Date(event.date).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                </div>
              </div>

              <div className="detail-item">
                <span className="detail-icon">📍</span>
                <div>
                  <strong>Location</strong>
                  <p>{event.location}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="booking-sidebar">
            <div className="booking-card">
              <h3>Book Your Spot</h3>
              
              {user ? (
                <>
                  <p className="booking-info">
                    Ready to attend this event? Click below to proceed with booking.
                  </p>
                  <button className="btn-book">
                    Book Now
                  </button>
                </>
              ) : (
                <>
                  <p className="booking-info">
                    Please login to book this event
                  </p>
                  <button 
                    className="btn-book"
                    onClick={() => navigate('/login')}
                  >
                    Login to Book
                  </button>
                </>
              )}
            </div>

            {/* Organizer Info */}
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
