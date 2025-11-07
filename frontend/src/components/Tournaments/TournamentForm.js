import { useState } from 'react';
import { createTournament } from '../../services/tournamentService';
import './Tournaments.css';

const TournamentForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    time: '',
    location: ''
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('date', formData.date);
      data.append('time', formData.time);
      data.append('location', formData.location);
      
      if (image) {
        data.append('image', image);
      }

      await createTournament(data);
      onSuccess();
    } catch (error) {
      console.error('Error creando torneo:', error);
      setError(error.response?.data?.message || 'Error al crear el torneo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tournament-form-container">
      <h2>Crear Nuevo Torneo</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="tournament-form">
        <div className="form-group">
          <label>Nombre del Torneo *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            maxLength="100"
            placeholder="Ej: Campeonato Regional 2025"
          />
        </div>

        <div className="form-group">
          <label>Descripción *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            maxLength="500"
            rows="4"
            placeholder="Describe el torneo..."
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Fecha *</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="form-group">
            <label>Hora *</label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Lugar *</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            maxLength="200"
            placeholder="Dirección o nombre del lugar"
          />
        </div>

        <div className="form-group">
          <label>Imagen del Torneo</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Preview" />
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn-cancel">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? 'Creando...' : 'Crear Torneo'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TournamentForm;