import { useState } from 'react';
import TournamentList from './TournamentList';
import TournamentForm from './TournamentForm';

const Tournaments = () => {
  const [showForm, setShowForm] = useState(false);

  const handleCreateSuccess = () => {
    setShowForm(false);
    // La lista se recargará automáticamente
  };

  return (
    <div>
      {showForm ? (
        <TournamentForm
          onSuccess={handleCreateSuccess}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <TournamentList onCreateClick={() => setShowForm(true)} />
      )}
    </div>
  );
};

export default Tournaments;