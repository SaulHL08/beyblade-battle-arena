import React, { useState, useEffect } from 'react';
import { getUserBeyblades, createBeyblade, deleteBeyblade, getComponents } from '../../services/garageService';

const Garage = () => {
  const [beyblades, setBeyblades] = useState([]);
  const [components, setComponents] = useState({ blades: [], ratchets: [], bits: [] });
  const [showConstructor, setShowConstructor] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Constructor state
  const [selectedBlade, setSelectedBlade] = useState('');
  const [selectedRatchet, setSelectedRatchet] = useState('');
  const [selectedBit, setSelectedBit] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [beybladeData, componentData] = await Promise.all([
        getUserBeyblades(),
        getComponents()
      ]);
      setBeyblades(beybladeData);
      setComponents(componentData);
    } catch (error) {
      setError('Error cargando datos del garage');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBeyblade = async () => {
    if (!selectedBlade || !selectedRatchet || !selectedBit) {
      setError('Selecciona todos los componentes');
      return;
    }

    setCreating(true);
    setError('');

    try {
      await createBeyblade({
        blade: selectedBlade,
        ratchet: selectedRatchet,
        bit: selectedBit
      });

      // Recargar lista
      await loadData();
      
      // Limpiar constructor
      setSelectedBlade('');
      setSelectedRatchet('');
      setSelectedBit('');
      setShowConstructor(false);

    } catch (error) {
      setError(error.response?.data?.message || 'Error creando Beyblade');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteBeyblade = async (beybladeId) => {
    if (!window.confirm('¿Estás seguro de eliminar este Beyblade?')) return;

    try {
      await deleteBeyblade(beybladeId);
      await loadData();
    } catch (error) {
      setError('Error eliminando Beyblade');
    }
  };

  const getImagePath = (imageName) => {
    return `/images/${imageName}`;
  };

  const getBladeImage = (bladeName) => {
    const blade = components.blades.find(b => b.name === bladeName);
    return blade ? blade.image : 'BladeDranSword.png';
  };

  if (loading) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '50px',
        color: 'white',
        fontSize: '18px'
      }}>
        Cargando garage...
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* CSS para la animación de rotación */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spinning-blade {
          animation: spin 3s linear infinite;
        }
      `}</style>

      <header style={{ 
        background: 'linear-gradient(45deg, #ff6b35, #f7931e)', 
        padding: '30px', 
        borderRadius: '15px', 
        color: 'white', 
        textAlign: 'center',
        marginBottom: '30px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
      }}>
        <h1>⚙️ Mi Garage</h1>
        <p>Personaliza y mejora tus Beyblades</p>
      </header>

      {error && (
        <div style={{ 
          color: '#721c24',
          background: '#f8d7da', 
          padding: '15px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          border: '1px solid #f5c6cb'
        }}>
          {error}
        </div>
      )}

      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        {beyblades.length < 3 ? (
          <button 
            onClick={() => setShowConstructor(!showConstructor)}
            style={{
              padding: '15px 30px',
              backgroundColor: '#ff6b35',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              boxShadow: '0 5px 15px rgba(255, 107, 53, 0.4)',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0px)'}
          >
            {showConstructor ? 'Cancelar' : '+ Crear Nuevo Beyblade'}
          </button>
        ) : (
          <p style={{ 
            color: 'white', 
            background: 'rgba(255,255,255,0.1)', 
            padding: '15px', 
            borderRadius: '10px',
            backdropFilter: 'blur(10px)'
          }}>
            Máximo 3 Beyblades permitidos ({beyblades.length}/3)
          </p>
        )}
      </div>

      {/* Constructor de Beyblades */}
      {showConstructor && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '25px',
          borderRadius: '15px',
          marginBottom: '30px',
          border: '3px solid #ff6b35',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          color: '#333'
        }}>
          <h3 style={{ color: '#ff6b35', marginBottom: '20px' }}>🔧 Constructor de Beyblades</h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '25px', 
            marginBottom: '25px' 
          }}>
            {/* Selector de Blade */}
            <div>
              <h4 style={{ color: '#333', marginBottom: '15px', textAlign: 'center' }}>⚔️ Blade</h4>
              {components.blades.map(blade => (
                <div 
                  key={blade.name}
                  onClick={() => setSelectedBlade(blade.name)}
                  style={{
                    padding: '15px',
                    margin: '10px 0',
                    backgroundColor: selectedBlade === blade.name ? '#ff6b35' : '#f8f9fa',
                    color: selectedBlade === blade.name ? 'white' : '#333',
                    border: `3px solid ${selectedBlade === blade.name ? '#ff6b35' : '#dee2e6'}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.3s',
                    boxShadow: selectedBlade === blade.name ? '0 5px 15px rgba(255, 107, 53, 0.3)' : '0 2px 5px rgba(0,0,0,0.1)'
                  }}
                  onMouseOver={(e) => {
                    if (selectedBlade !== blade.name) {
                      e.target.style.borderColor = '#ff6b35';
                      e.target.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (selectedBlade !== blade.name) {
                      e.target.style.borderColor = '#dee2e6';
                      e.target.style.transform = 'translateY(0px)';
                    }
                  }}
                >
                  <img 
                    src={getImagePath(blade.image)} 
                    alt={blade.name}
                    style={{ 
                      width: '60px', 
                      height: '60px', 
                      marginBottom: '10px',
                      filter: selectedBlade === blade.name ? 'brightness(1.2)' : 'none'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.fontSize = '2rem';
                    }}
                  />
                  <div style={{ fontSize: '1.5rem', display: 'none' }}>⚔️</div>
                  <div><strong>{blade.name}</strong></div>
                  <div style={{ fontSize: '14px', marginTop: '5px' }}>
                    ATK: {blade.attack} | DEF: {blade.defense}
                  </div>
                </div>
              ))}
            </div>

            {/* Selector de Ratchet */}
            <div>
              <h4 style={{ color: '#333', marginBottom: '15px', textAlign: 'center' }}>🔩 Ratchet</h4>
              {components.ratchets.map(ratchet => (
                <div 
                  key={ratchet.name}
                  onClick={() => setSelectedRatchet(ratchet.name)}
                  style={{
                    padding: '15px',
                    margin: '10px 0',
                    backgroundColor: selectedRatchet === ratchet.name ? '#ff6b35' : '#f8f9fa',
                    color: selectedRatchet === ratchet.name ? 'white' : '#333',
                    border: `3px solid ${selectedRatchet === ratchet.name ? '#ff6b35' : '#dee2e6'}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.3s',
                    boxShadow: selectedRatchet === ratchet.name ? '0 5px 15px rgba(255, 107, 53, 0.3)' : '0 2px 5px rgba(0,0,0,0.1)'
                  }}
                  onMouseOver={(e) => {
                    if (selectedRatchet !== ratchet.name) {
                      e.target.style.borderColor = '#ff6b35';
                      e.target.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (selectedRatchet !== ratchet.name) {
                      e.target.style.borderColor = '#dee2e6';
                      e.target.style.transform = 'translateY(0px)';
                    }
                  }}
                >
                  <img 
                    src={getImagePath(ratchet.image)} 
                    alt={ratchet.name}
                    style={{ 
                      width: '60px', 
                      height: '60px', 
                      marginBottom: '10px',
                      filter: selectedRatchet === ratchet.name ? 'brightness(1.2)' : 'none'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.fontSize = '2rem';
                    }}
                  />
                  <div style={{ fontSize: '1.5rem', display: 'none' }}>🔩</div>
                  <div><strong>{ratchet.name}</strong></div>
                </div>
              ))}
            </div>

            {/* Selector de Bit */}
            <div>
              <h4 style={{ color: '#333', marginBottom: '15px', textAlign: 'center' }}>⚡ Bit</h4>
              {components.bits.map(bit => (
                <div 
                  key={bit.name}
                  onClick={() => setSelectedBit(bit.name)}
                  style={{
                    padding: '15px',
                    margin: '10px 0',
                    backgroundColor: selectedBit === bit.name ? '#ff6b35' : '#f8f9fa',
                    color: selectedBit === bit.name ? 'white' : '#333',
                    border: `3px solid ${selectedBit === bit.name ? '#ff6b35' : '#dee2e6'}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.3s',
                    boxShadow: selectedBit === bit.name ? '0 5px 15px rgba(255, 107, 53, 0.3)' : '0 2px 5px rgba(0,0,0,0.1)'
                  }}
                  onMouseOver={(e) => {
                    if (selectedBit !== bit.name) {
                      e.target.style.borderColor = '#ff6b35';
                      e.target.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (selectedBit !== bit.name) {
                      e.target.style.borderColor = '#dee2e6';
                      e.target.style.transform = 'translateY(0px)';
                    }
                  }}
                >
                  <img 
                    src={getImagePath(bit.image)} 
                    alt={bit.name}
                    style={{ 
                      width: '60px', 
                      height: '60px', 
                      marginBottom: '10px',
                      filter: selectedBit === bit.name ? 'brightness(1.2)' : 'none'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.fontSize = '2rem';
                    }}
                  />
                  <div style={{ fontSize: '1.5rem', display: 'none' }}>⚡</div>
                  <div><strong>{bit.name}</strong></div>
                  <div style={{ fontSize: '14px', marginTop: '5px' }}>
                    STA: {bit.stamina}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vista previa */}
          {selectedBlade && selectedRatchet && selectedBit && (
            <div style={{ 
              textAlign: 'center', 
              marginBottom: '25px',
              padding: '20px',
              background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
              borderRadius: '12px',
              color: 'white'
            }}>
              <h4 style={{ margin: '0 0 10px 0' }}>Vista Previa:</h4>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                {selectedBlade} {selectedRatchet} {selectedBit}
              </div>
            </div>
          )}

          <div style={{ textAlign: 'center' }}>
            <button 
              onClick={handleCreateBeyblade}
              disabled={!selectedBlade || !selectedRatchet || !selectedBit || creating}
              style={{
                padding: '15px 30px',
                backgroundColor: (selectedBlade && selectedRatchet && selectedBit && !creating) ? '#28a745' : '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                cursor: (selectedBlade && selectedRatchet && selectedBit && !creating) ? 'pointer' : 'not-allowed',
                fontSize: '16px',
                fontWeight: 'bold',
                boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
                transition: 'all 0.3s'
              }}
            >
              {creating ? 'Creando...' : 'Ensamblar Beyblade'}
            </button>
          </div>
        </div>
      )}

      {/* Lista de Beyblades */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
        gap: '25px' 
      }}>
        {beyblades.map(beyblade => (
          <div key={beyblade._id} style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '25px',
            border: '2px solid rgba(255, 107, 53, 0.3)',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            color: '#333',
            transition: 'transform 0.3s'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0px)'}
          >
            <div style={{
              width: '120px',
              height: '120px',
              margin: '0 auto 15px',
              background: 'linear-gradient(45deg, #ff6b35, #f7931e, #ffcd3c)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 5px 20px rgba(255, 107, 53, 0.4)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <img 
                src={getImagePath(getBladeImage(beyblade.blade))} 
                alt={beyblade.blade}
                className="spinning-blade"
                style={{ 
                  width: '90px', 
                  height: '90px',
                  objectFit: 'contain',
                  filter: 'brightness(1.1) contrast(1.1)'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div style={{ 
                fontSize: '3rem', 
                display: 'none',
                animation: 'spin 3s linear infinite'
              }}>
                ⚡
              </div>
            </div>
            
            <h3 style={{ color: '#ff6b35', marginBottom: '20px' }}>{beyblade.name}</h3>
            
            <div style={{ margin: '20px 0', textAlign: 'left' }}>
              <div style={{ marginBottom: '10px' }}>
                <strong>Ataque: {beyblade.attack}</strong>
              </div>
              <div style={{ background: '#e9ecef', height: '10px', borderRadius: '5px', marginBottom: '15px' }}>
                <div style={{ 
                  background: 'linear-gradient(90deg, #ff6b35, #f7931e)', 
                  height: '100%', 
                  width: `${beyblade.attack}%`, 
                  borderRadius: '5px',
                  transition: 'width 0.5s ease'
                }}></div>
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <strong>Defensa: {beyblade.defense}</strong>
              </div>
              <div style={{ background: '#e9ecef', height: '10px', borderRadius: '5px', marginBottom: '15px' }}>
                <div style={{ 
                  background: 'linear-gradient(90deg, #17a2b8, #138496)', 
                  height: '100%', 
                  width: `${beyblade.defense}%`, 
                  borderRadius: '5px',
                  transition: 'width 0.5s ease'
                }}></div>
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <strong>Resistencia: {beyblade.stamina}</strong>
              </div>
              <div style={{ background: '#e9ecef', height: '10px', borderRadius: '5px', marginBottom: '20px' }}>
                <div style={{ 
                  background: 'linear-gradient(90deg, #28a745, #20c997)', 
                  height: '100%', 
                  width: `${beyblade.stamina}%`, 
                  borderRadius: '5px',
                  transition: 'width 0.5s ease'
                }}></div>
              </div>
            </div>
            
            <button 
              onClick={() => handleDeleteBeyblade(beyblade._id)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                transition: 'all 0.3s',
                boxShadow: '0 3px 10px rgba(220, 53, 69, 0.3)'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#c82333';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#dc3545';
                e.target.style.transform = 'translateY(0px)';
              }}
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>

      {beyblades.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          backdropFilter: 'blur(10px)',
          color: 'white'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>⚙️</div>
          <h3>No tienes Beyblades aún</h3>
          <p>¡Crea tu primer Beyblade para comenzar!</p>
        </div>
      )}
    </div>
  );
};

export default Garage;