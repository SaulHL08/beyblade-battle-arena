import React, { useState, useEffect, useRef } from 'react';
import { getProfile, updateProfile, uploadProfileImage, uploadCoverImage } from '../../services/profileService';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
  const { currentUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState({ profile: null, cover: null });
  const [uploadingImage, setUploadingImage] = useState({ profile: false, cover: false });
  
  // Referencias para inputs de archivos
  const profileImageRef = useRef(null);
  const coverImageRef = useRef(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await getProfile();
      console.log('Datos del perfil cargados:', data); // Debug
      console.log('Imagen de perfil:', data.user.profileImage); // Debug específico
      setProfileData(data);
      setEditBio(data.user.bio || '');
    } catch (error) {
      setError('Error cargando perfil');
      console.error('Error en loadProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBio = async () => {
    setSaving(true);
    setError('');
    
    try {
      await updateProfile({ bio: editBio });
      await loadProfile();
      setEditMode(false);
    } catch (error) {
      setError('Error actualizando perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleProfileImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten archivos de imagen');
      return;
    }

    // Validar tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      setError('El archivo es demasiado grande. Máximo 5MB.');
      return;
    }

    setUploadingImage(prev => ({ ...prev, profile: true }));
    setError('');

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(prev => ({ ...prev, profile: e.target.result }));
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('profileImage', file);

    try {
      await uploadProfileImage(formData);
      await loadProfile();
      setImagePreview(prev => ({ ...prev, profile: null }));
    } catch (error) {
      setError('Error subiendo imagen de perfil');
      setImagePreview(prev => ({ ...prev, profile: null }));
    } finally {
      setUploadingImage(prev => ({ ...prev, profile: false }));
    }
  };

  const handleCoverImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten archivos de imagen');
      return;
    }

    // Validar tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      setError('El archivo es demasiado grande. Máximo 5MB.');
      return;
    }

    setUploadingImage(prev => ({ ...prev, cover: true }));
    setError('');

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(prev => ({ ...prev, cover: e.target.result }));
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('coverImage', file);

    try {
      await uploadCoverImage(formData);
      await loadProfile();
      setImagePreview(prev => ({ ...prev, cover: null }));
    } catch (error) {
      setError('Error subiendo imagen de portada');
      setImagePreview(prev => ({ ...prev, cover: null }));
    } finally {
      setUploadingImage(prev => ({ ...prev, cover: false }));
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    const url = `${window.location.origin}/${imagePath}`;
    console.log('Imagen URL generada:', url); // Debug
    return url;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getBeybladeImage = (bladeName) => {
    const bladeImages = {
      'DranSword': 'BladeDranSword.png',
      'DranDagger': 'BladeDranDagger.png',
      'DranBuster': 'BladeDranBuster.png'
    };
    return `/images/${bladeImages[bladeName] || 'BladeDranSword.png'}`;
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        color: 'white',
        fontSize: '18px'
      }}>
        Cargando perfil...
      </div>
    );
  }

  if (!profileData) {
    return (
      <div style={{ 
        textAlign: 'center', 
        color: 'white', 
        fontSize: '18px', 
        padding: '50px' 
      }}>
        Error cargando perfil
      </div>
    );
  }

  const { user, beyblades, stats, achievements } = profileData;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* CSS para animaciones */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .fade-in {
          animation: fadeIn 0.6s ease-out;
        }
        
        .spinning-blade {
          animation: spin 3s linear infinite;
        }
        
        .hover-scale {
          transition: transform 0.3s ease;
        }
        
        .hover-scale:hover {
          transform: scale(1.05);
        }
        
        .glass-effect {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .profile-overlay:hover {
          opacity: 1 !important;
        }
      `}</style>

      {error && (
        <div style={{
          background: '#ff6b35',
          color: 'white',
          padding: '15px',
          borderRadius: '10px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      {/* Header con imagen de portada */}
      <div className="fade-in" style={{
        position: 'relative',
        height: '300px',
        borderRadius: '20px',
        overflow: 'hidden',
        marginBottom: '80px',
        background: !user.coverImage ? 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #ff6b35 100%)' : '#000',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
      }}>
        {/* Imagen de portada */}
        {(imagePreview.cover || user.coverImage) && (
          <img 
            src={imagePreview.cover || getImageUrl(user.coverImage)}
            alt="Imagen de portada"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              opacity: uploadingImage.cover ? 0.7 : 1,
              transition: 'opacity 0.3s'
            }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.style.background = 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #ff6b35 100%)';
            }}
          />
        )}
        
        {/* Indicador de carga para portada */}
        {uploadingImage.cover && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '15px 25px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <div style={{
              width: '20px',
              height: '20px',
              border: '2px solid #fff',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            Subiendo imagen...
          </div>
        )}
        
        {/* Overlay oscuro */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6))'
        }} />
        
        {/* Botón para cambiar portada */}
        <button
          onClick={() => !uploadingImage.cover && coverImageRef.current?.click()}
          disabled={uploadingImage.cover}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            padding: '10px 15px',
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '20px',
            color: 'white',
            cursor: uploadingImage.cover ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'all 0.3s',
            opacity: uploadingImage.cover ? 0.7 : 1
          }}
          onMouseOver={(e) => {
            if (!uploadingImage.cover) {
              e.target.style.background = 'rgba(255, 255, 255, 0.3)';
              e.target.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseOut={(e) => {
            if (!uploadingImage.cover) {
              e.target.style.background = 'rgba(255, 255, 255, 0.2)';
              e.target.style.transform = 'translateY(0px)';
            }
          }}
        >
          {uploadingImage.cover ? '⏳ Subiendo...' : '📸 Cambiar Portada'}
        </button>

        {/* Avatar del usuario */}
        <div style={{
          position: 'absolute',
          bottom: '-50px',
          left: '50px',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          border: '5px solid white',
          overflow: 'hidden',
          background: !(imagePreview.profile || user.profileImage) ? 'linear-gradient(45deg, #ff6b35, #f7931e)' : 'white',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          cursor: uploadingImage.profile ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onClick={() => !uploadingImage.profile && profileImageRef.current?.click()}
        >
          {/* Imagen de perfil */}
          {(imagePreview.profile || user.profileImage) && (
            <img 
              src={imagePreview.profile || getImageUrl(user.profileImage)} 
              alt="Foto de perfil"
              style={{
                width: '110px',
                height: '110px',
                borderRadius: '50%',
                objectFit: 'cover',
                objectPosition: 'center',
                opacity: uploadingImage.profile ? 0.7 : 1,
                transition: 'opacity 0.3s'
              }}
              onError={(e) => {
                console.log('Error cargando imagen de perfil');
                e.target.style.display = 'none';
              }}
              onLoad={() => console.log('Imagen de perfil cargada correctamente')}
            />
          )}
          
          {/* Icono por defecto */}
          {!(imagePreview.profile || user.profileImage) && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              fontSize: '3rem',
              color: 'white'
            }}>
              👤
            </div>
          )}

          {/* Indicador de carga para perfil */}
          {uploadingImage.profile && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(0,0,0,0.8)',
              color: 'white',
              padding: '5px',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10
            }}>
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid #fff',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            </div>
          )}

          {/* Overlay hover */}
          {!uploadingImage.profile && (imagePreview.profile || user.profileImage) && (
            <div 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0,
                transition: 'opacity 0.3s',
                fontSize: '1.5rem',
                color: 'white',
                borderRadius: '50%'
              }}
              onMouseOver={(e) => e.currentTarget.style.opacity = 1}
              onMouseOut={(e) => e.currentTarget.style.opacity = 0}
            >
              📸
            </div>
          )}
        </div>

        {/* Información básica del usuario */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '200px',
          color: 'white'
        }}>
          <h1 style={{ margin: '0 0 5px 0', fontSize: '2.5rem', fontWeight: 'bold', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
            {user.username}
          </h1>
          <p style={{ margin: '0', fontSize: '16px', opacity: 0.9, textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
            Nivel {user.level} • Miembro desde hace {user.memberSince} días
          </p>
        </div>

        {/* Inputs ocultos para subir imágenes */}
        <input
          ref={profileImageRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleProfileImageUpload}
        />
        <input
          ref={coverImageRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleCoverImageUpload}
        />
      </div>

      {/* Contenido principal */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gap: '30px',
        marginBottom: '30px'
      }}>
        {/* Columna izquierda - Información personal */}
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Bio */}
          <div className="glass-effect hover-scale" style={{
            padding: '25px',
            borderRadius: '15px',
            color: 'white'
          }}>
            <h3 style={{ color: '#ff6b35', marginBottom: '15px' }}>📝 Biografía</h3>
            {editMode ? (
              <div>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  maxLength={200}
                  style={{
                    width: '100%',
                    minHeight: '80px',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    resize: 'vertical',
                    fontSize: '14px'
                  }}
                  placeholder="Cuéntanos sobre ti..."
                />
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button
                    onClick={handleUpdateBio}
                    disabled={saving}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '15px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    {saving ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button
                    onClick={() => {
                      setEditMode(false);
                      setEditBio(user.bio || '');
                    }}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '15px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p style={{ lineHeight: '1.6', marginBottom: '15px' }}>
                  {user.bio || 'Este usuario aún no ha escrito su biografía.'}
                </p>
                <button
                  onClick={() => setEditMode(true)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#ff6b35',
                    color: 'white',
                    border: 'none',
                    borderRadius: '15px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  ✏️ Editar
                </button>
              </div>
            )}
          </div>

          {/* Estadísticas */}
          <div className="glass-effect hover-scale" style={{
            padding: '25px',
            borderRadius: '15px',
            color: 'white'
          }}>
            <h3 style={{ color: '#ff6b35', marginBottom: '20px' }}>📊 Estadísticas</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Victorias:</span>
                <strong style={{ color: '#28a745', fontSize: '18px' }}>{stats.wins}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Derrotas:</span>
                <strong style={{ color: '#dc3545', fontSize: '18px' }}>{stats.losses}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Batallas Totales:</span>
                <strong style={{ color: '#6c757d', fontSize: '18px' }}>{stats.totalBattles}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Ratio de Victoria:</span>
                <strong style={{ color: '#ff6b35', fontSize: '18px' }}>{stats.winRate}%</strong>
              </div>
            </div>
            
            {/* Barra de progreso del nivel */}
            <div style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span>Nivel {user.level}</span>
                <span>{Math.min(user.level * 150, 1000)}/1000 XP</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.2)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{
                  background: 'linear-gradient(90deg, #ff6b35, #f7931e)',
                  height: '100%',
                  width: `${Math.min(user.level * 15, 100)}%`,
                  borderRadius: '5px',
                  transition: 'width 1s ease'
                }}></div>
              </div>
            </div>
          </div>

          {/* Logros */}
          <div className="glass-effect hover-scale" style={{
            padding: '25px',
            borderRadius: '15px',
            color: 'white'
          }}>
            <h3 style={{ color: '#ff6b35', marginBottom: '20px' }}>🏆 Logros</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {achievements.length > 0 ? achievements.map((achievement, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  padding: '15px',
                  background: 'rgba(255, 107, 53, 0.1)',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 107, 53, 0.3)'
                }}>
                  <div style={{ fontSize: '2rem' }}>{achievement.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>{achievement.name}</div>
                    <div style={{ fontSize: '14px', opacity: 0.8 }}>{achievement.description}</div>
                  </div>
                </div>
              )) : (
                <div style={{ textAlign: 'center', opacity: 0.7, padding: '20px' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🎯</div>
                  <p>¡Comienza a jugar para desbloquear logros!</p>
                </div>
              )}
            </div>
          </div>

          {/* Información adicional */}
          <div className="glass-effect hover-scale" style={{
            padding: '25px',
            borderRadius: '15px',
            color: 'white'
          }}>
            <h3 style={{ color: '#ff6b35', marginBottom: '20px' }}>ℹ️ Información</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
              <div><strong>ID Usuario:</strong> <span style={{ fontFamily: 'monospace', opacity: 0.8 }}>{user.id}</span></div>
              <div><strong>Email:</strong> {user.email}</div>
              <div><strong>Se unió:</strong> {formatDate(user.joinDate)}</div>
              <div><strong>Último acceso:</strong> {formatDate(user.lastLogin)}</div>
            </div>
          </div>
        </div>

        {/* Columna derecha - Beyblades */}
        <div className="fade-in">
          <div className="glass-effect" style={{
            padding: '25px',
            borderRadius: '15px',
            color: 'white'
          }}>
            <h3 style={{ color: '#ff6b35', marginBottom: '25px', textAlign: 'center' }}>⚔️ Mi Colección de Beyblades</h3>
            
            {beyblades.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px'
              }}>
                {beyblades.map((beyblade, index) => (
                  <div key={beyblade._id} className="hover-scale" style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '15px',
                    padding: '20px',
                    border: '2px solid rgba(255, 107, 53, 0.3)',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    {/* Badge de favorito si es el caso */}
                    {user.favoriteBeyblade && user.favoriteBeyblade._id === beyblade._id && (
                      <div style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
                        color: 'white',
                        padding: '5px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        ⭐ Favorito
                      </div>
                    )}

                    {/* Imagen del Beyblade con animación */}
                    <div style={{
                      width: '100px',
                      height: '100px',
                      margin: '0 auto 15px',
                      background: 'linear-gradient(45deg, #ff6b35, #f7931e, #ffcd3c)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 5px 20px rgba(255, 107, 53, 0.4)'
                    }}>
                      <img
                        src={getBeybladeImage(beyblade.blade)}
                        alt={beyblade.blade}
                        className="spinning-blade"
                        style={{
                          width: '80px',
                          height: '80px',
                          objectFit: 'contain',
                          filter: 'brightness(1.1) contrast(1.1)'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <div style={{
                        fontSize: '2rem',
                        display: 'none'
                      }} className="spinning-blade">
                        ⚡
                      </div>
                    </div>

                    {/* Información del Beyblade */}
                    <h4 style={{ color: '#ff6b35', marginBottom: '15px' }}>{beyblade.name}</h4>
                    
                    {/* Componentes */}
                    <div style={{ marginBottom: '15px', fontSize: '14px' }}>
                      <div style={{ marginBottom: '5px' }}>
                        <strong>Blade:</strong> {beyblade.blade}
                      </div>
                      <div style={{ marginBottom: '5px' }}>
                        <strong>Ratchet:</strong> {beyblade.ratchet}
                      </div>
                      <div>
                        <strong>Bit:</strong> {beyblade.bit}
                      </div>
                    </div>

                    {/* Estadísticas compactas */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '15px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '12px', opacity: 0.8 }}>ATK</div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ff6b35' }}>{beyblade.attack}</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '12px', opacity: 0.8 }}>DEF</div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#17a2b8' }}>{beyblade.defense}</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '12px', opacity: 0.8 }}>STA</div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#28a745' }}>{beyblade.stamina}</div>
                      </div>
                    </div>

                    {/* Botón para marcar como favorito */}
                    {(!user.favoriteBeyblade || user.favoriteBeyblade._id !== beyblade._id) && (
                      <button
                        onClick={() => handleSetFavorite(beyblade._id)}
                        style={{
                          marginTop: '15px',
                          padding: '8px 15px',
                          background: 'rgba(255, 107, 53, 0.2)',
                          border: '1px solid #ff6b35',
                          borderRadius: '15px',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '12px',
                          transition: 'all 0.3s'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.background = '#ff6b35';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.background = 'rgba(255, 107, 53, 0.2)';
                        }}
                      >
                        ⭐ Marcar como favorito
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                opacity: 0.7
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>⚙️</div>
                <h4>No tienes Beyblades aún</h4>
                <p>¡Ve al Garage para crear tu primera máquina de batalla!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Función para marcar Beyblade como favorito
  async function handleSetFavorite(beybladeId) {
    try {
      await updateProfile({ favoriteBeyblade: beybladeId });
      await loadProfile();
    } catch (error) {
      setError('Error marcando como favorito');
    }
  }
};

export default Profile;