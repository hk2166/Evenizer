import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Event } from '../types';
import '../styles/Home.css';

export default function Home() {
  // State
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch events on mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await eventAPI.getAllEvents();
        setEvents(data.events || []);
      } catch (err: any) {
        setError('Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return <div className="loading">Loading events...</div>;
  }

  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>Welcome to EventHub</h1>
        <p>Discover and book amazing events</p>
        {user && <p className="welcome-user">Hello, {user.name}!</p>}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="events-container">
        <h2>Upcoming Events</h2>
        
        {events.length === 0 ? (
          <p className="no-events">No events available at the moment.</p>
        ) : (
          <div className="events-grid">
            {events.map((event) => (
              <div key={event.id} className="event-card">
                <h3>{event.title}</h3>
                <p className="event-description">{event.description}</p>
                <div className="event-details">
                  <p>📍 {event.location}</p>
                  <p>📅 {new Date(event.date).toLocaleDateString()}</p>
                </div>
                <button 
                  className="btn-view"
                  onClick={() => navigate(`/events/${event.id}`)}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
