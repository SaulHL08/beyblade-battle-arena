import { useState, useEffect, useCallback } from 'react';
import { getAllTournaments } from '../../services/tournamentService';
import TournamentCard from './TournamentCard';
import './Tournaments.css';

const TournamentList = ({ onCreateClick }) => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const loadTournaments = useCallback(async () => {
    try {
      setLoading(true);
      const filters = filter === 'upcoming' ? { upcoming: 'true' } : {};
      const data = await getAllTournaments(filters);
      setTournaments(data);
    } catch (error) {
      console.error('Error cargando torneos:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadTournaments();
  }, [loadTournaments]);

  return (
    <div className="tournament-list-container">
      <div className="tournament-header">
        <h1>Torneos Beyblade</h1>
        <button className="btn-create-tournament" onClick={onCreateClick}>
          + Crear Torneo
        </button>
      </div>

      <div className="tournament-filters">
        <button
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          Todos
        </button>
        <button
          className={filter === 'upcoming' ? 'active' : ''}
          onClick={() => setFilter('upcoming')}
        >
          Próximos
        </button>
      </div>

      {loading ? (
        <div className="loading">Cargando torneos...</div>
      ) : tournaments.length === 0 ? (
        <div className="no-tournaments">
          <p>No hay torneos disponibles</p>
          <button className="btn-primary" onClick={onCreateClick}>
            Crear el primer torneo
          </button>
        </div>
      ) : (
        <div className="tournaments-grid">
          {tournaments.map(tournament => (
            <TournamentCard
              key={tournament._id}
              tournament={tournament}
              onUpdate={loadTournaments}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TournamentList;