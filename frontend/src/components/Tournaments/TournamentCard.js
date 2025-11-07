import { useState } from 'react';
import { joinTournament, leaveTournament } from '../../services/tournamentService';
import { useAuth } from '../../context/AuthContext';
import './Tournaments.css';

const TournamentCard = ({ tournament, onUpdate }) => {
  const { currentUser } = useAuth();
  const [joining, setJoining] = useState(false);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isParticipant = () => {
    if (!currentUser) return false;
    return tournament.participants?.some(p => p._id === currentUser.id || p === currentUser.id);
  };

  const handleJoin = async () => {
    if (!currentUser) {
      alert('Debes iniciar sesión para unirte a un torneo');
      return;
    }

    try {
      setJoining(true);
      if (isParticipant()) {
        await leaveTournament(tournament._id);
      } else {
        await joinTournament(tournament._id);
      }
      onUpdate();
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.message || 'Error al procesar la solicitud');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="tournament-card">
      {tournament.image && (
        <div className="tournament-image">
          <img 
            src={`http://localhost:5000/${tournament.image}`} 
            alt={tournament.name}
          />
        </div>
      )}
      
      <div className="tournament-content">
        <h3>{tournament.name}</h3>
        <p className="tournament-description">{tournament.description}</p>
        
        <div className="tournament-details">
          <div className="detail-item">
            <span className="icon">📅</span>
            <span>{formatDate(tournament.date)}</span>
          </div>
          <div className="detail-item">
            <span className="icon">⏰</span>
            <span>{tournament.time}</span>
          </div>
          <div className="detail-item">
            <span className="icon">📍</span>
            <span>{tournament.location}</span>
          </div>
          <div className="detail-item">
            <span className="icon">👥</span>
            <span>{tournament.participants?.length || 0} participantes</span>
          </div>
        </div>

        <div className="tournament-creator">
          <span>Creado por: <strong>{tournament.createdBy?.username}</strong></span>
        </div>

        <button
          className={`btn-join ${isParticipant() ? 'joined' : ''}`}
          onClick={handleJoin}
          disabled={joining}
        >
          {joining ? 'Procesando...' : isParticipant() ? '✓ Inscrito' : 'Unirse'}
        </button>
      </div>
    </div>
  );
};

export default TournamentCard;