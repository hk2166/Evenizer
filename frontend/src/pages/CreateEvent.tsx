import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/CreateEvent.css';

export default function CreateEvent() {
  const { user } = useAuth();


  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title || !description || !date || !location) {
      setError('Please fill in all fields');
      return;
    }
    if (!user) {
      setError('You must be logged in to create an event');
      return;
    }
    setLoading(true);

    // Debug: Log what we're sending
    console.log('Sending event data:', {
      title,
      description,
      date,
      location,
      organizerId: user.userId,
    });

    try {
      const response = await eventAPI.createEvent({
        title,
        description,
        date,
        location,
        organizerId: user.userId,
      });

      navigate(`/events/${response.event.id}`);
    } catch (err: any) {
      // Debug: Log the full error
      console.error('Create event error:', err);
      console.error('Error response:', err.response?.data);
      console.error('Validation errors:', err.response?.data?.errors);
      
      setError(err.response?.data?.message || 'Failed to create an Event');
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
          <div className="form-group">
            <label htmlFor="title">Event Title</label>
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
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your event"
              rows={5}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="date">Date & Time</label>
            <input
              type="datetime-local"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter event location"
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Event'}
          </button>
        </form>
      </div>
    </div>
  );
}
