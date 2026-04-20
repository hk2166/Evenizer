import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/FAB.css';

export default function CreateEventFAB() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Don't show if user is not logged in
  if (!user) return null;

  return (
    <button 
      className="fab"
      onClick={() => navigate('/events/create')}
      title="Create Event"
    >
      <span className="fab-icon">+</span>
    </button>
  );
}
