import React, { useState, useEffect } from 'react';
import { getUserBeyblades, createBeyblade, deleteBeyblade, getComponents } from '../../services/garageService';
import { getInventory, addToInventory, removeFromInventory } from '../../services/inventoryService';
import { getWishlist, addToWishlist, removeFromWishlist, updateWishlistPriority } from '../../services/inventoryService';

const Garage = () => {
  const [beyblades, setBeyblades] = useState([]);
  const [components, setComponents] = useState({ blades: [], ratchets: [], bits: [] });
  const [inventory, setInventory] = useState({ items: [] });
  const [wishlist, setWishlist] = useState({ items: [] });
  const [showConstructor, setShowConstructor] = useState(false);
  const [showInventoryManager, setShowInventoryManager] = useState(false);
  const [showWishlistManager, setShowWishlistManager] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('beyblades'); // 'beyblades', 'inventory', 'wishlist'

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
      const [beybladeData, componentData, inventoryData, wishlistData] = await Promise.all([
        getUserBeyblades(),
        getComponents(),
        getInventory(),
        getWishlist()
      ]);
      setBeyblades(beybladeData);
      setComponents(componentData);
      setInventory(inventoryData);
      setWishlist(wishlistData);
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

      // Restar del inventario
      await removeFromInventory('blade', selectedBlade, 1);
      await removeFromInventory('ratchet', selectedRatchet, 1);
      await removeFromInventory('bit', selectedBit, 1);

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
    if (!window.confirm('¿Estás seguro de eliminar este Beyblade? Las piezas regresarán a tu inventario.')) return;

    try {
      const beyblade = beyblades.find(b => b._id === beybladeId);
      
      // Devolver piezas al inventario
      await addToInventory('blade', beyblade.blade, 1);
      await addToInventory('ratchet', beyblade.ratchet, 1);
      await addToInventory('bit', beyblade.bit, 1);
      
      await deleteBeyblade(beybladeId);
      await loadData();
    } catch (error) {
      setError('Error eliminando Beyblade');
    }
  };

  const handleAddToInventory = async (type, name) => {
    try {
      await addToInventory(type, name, 1);
      await loadData();
    } catch (error) {
      setError(error.response?.data?.message || 'Error agregando al inventario');
    }
  };

  const handleRemoveFromInventory = async (type, name) => {
    try {
      await removeFromInventory(type, name, 1);
      await loadData();
    } catch (error) {
      setError(error.response?.data?.message || 'Error removiendo del inventario');
    }
  };

  const handleAddToWishlist = async (type, name) => {
    try {
      await addToWishlist(type, name, 'medium');
      await loadData();
    } catch (error) {
      setError(error.response?.data?.message || 'Error agregando a wishlist');
    }
  };

  const handleRemoveFromWishlist = async (itemId) => {
    try {
      await removeFromWishlist(itemId);
      await loadData();
    } catch (error) {
      setError(error.response?.data?.message || 'Error removiendo de wishlist');
    }
  };

  const handleUpdateWishlistPriority = async (itemId, priority) => {
    try {
      await updateWishlistPriority(itemId, priority);
      await loadData();
    } catch (error) {
      setError('Error actualizando prioridad');
    }
  };

  const getInventoryCount = (type, name) => {
    const item = inventory.items.find(item => item.type === type && item.name === name);
    return item ? item.quantity : 0;
  };

  const isInWishlist = (type, name) => {
    return wishlist.items.some(item => item.type === type && item.name === name);
  };

  const getImagePath = (imageName) => {
    return `/images/${imageName}`;
  };

  const getBladeImage = (bladeName) => {
    const blade = components.blades.find(b => b.name === bladeName);
    return blade ? blade.image : 'BladeDranSword.png';
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getPriorityLabel = (priority) => {
    switch(priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return 'Media';
    }
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
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
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
        <p>Gestiona tus Beyblades, inventario y lista de deseos</p>
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
          <button 
            onClick={() => setError('')}
            style={{
              float: 'right',
              background: 'transparent',
              border: 'none',
              color: '#721c24',
              cursor: 'pointer',
              fontSize: '18px'
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Tabs de navegación */}
      <div style={{ 
        display: 'flex', 
        gap: '15px', 
        marginBottom: '30px',
        justifyContent: 'center'
      }}>
        <button
          onClick={() => setActiveTab('beyblades')}
          style={{
            padding: '12px 25px',
            backgroundColor: activeTab === 'beyblades' ? '#ff6b35' : 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            border: `2px solid ${activeTab === 'beyblades' ? '#ff6b35' : 'rgba(255, 255, 255, 0.3)'}`,
            borderRadius: '25px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            transition: 'all 0.3s'
          }}
        >
          ⚡ Mis Beyblades ({beyblades.length}/3)
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          style={{
            padding: '12px 25px',
            backgroundColor: activeTab === 'inventory' ? '#ff6b35' : 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            border: `2px solid ${activeTab === 'inventory' ? '#ff6b35' : 'rgba(255, 255, 255, 0.3)'}`,
            borderRadius: '25px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            transition: 'all 0.3s'
          }}
        >
          🎒 Mi Inventario ({inventory.items.reduce((sum, item) => sum + item.quantity, 0)})
        </button>
        <button
          onClick={() => setActiveTab('wishlist')}
          style={{
            padding: '12px 25px',
            backgroundColor: activeTab === 'wishlist' ? '#ff6b35' : 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            border: `2px solid ${activeTab === 'wishlist' ? '#ff6b35' : 'rgba(255, 255, 255, 0.3)'}`,
            borderRadius: '25px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            transition: 'all 0.3s'
          }}
        >
          ⭐ Wishlist ({wishlist.items.length})
        </button>
      </div>

      {/* Contenido según el tab activo */}
      {activeTab === 'beyblades' && (
        <div>
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
                  {components.blades.map(blade => {
                    const count = getInventoryCount('blade', blade.name);
                    const isAvailable = count > 0;
                    
                    return (
                      <div 
                        key={blade.name}
                        onClick={() => isAvailable && setSelectedBlade(blade.name)}
                        style={{
                          padding: '15px',
                          margin: '10px 0',
                          backgroundColor: selectedBlade === blade.name ? '#ff6b35' : (isAvailable ? '#f8f9fa' : '#e9ecef'),
                          color: selectedBlade === blade.name ? 'white' : (isAvailable ? '#333' : '#6c757d'),
                          border: `3px solid ${selectedBlade === blade.name ? '#ff6b35' : (isAvailable ? '#dee2e6' : '#adb5bd')}`,
                          borderRadius: '12px',
                          cursor: isAvailable ? 'pointer' : 'not-allowed',
                          textAlign: 'center',
                          transition: 'all 0.3s',
                          boxShadow: selectedBlade === blade.name ? '0 5px 15px rgba(255, 107, 53, 0.3)' : '0 2px 5px rgba(0,0,0,0.1)',
                          opacity: isAvailable ? 1 : 0.6,
                          position: 'relative'
                        }}
                      >
                        <div style={{
                          position: 'absolute',
                          top: '5px',
                          right: '10px',
                          background: isAvailable ? '#28a745' : '#dc3545',
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {count > 0 ? `x${count}` : 'x0'}
                        </div>
                        <img 
                          src={getImagePath(blade.image)} 
                          alt={blade.name}
                          style={{ 
                            width: '60px', 
                            height: '60px', 
                            marginBottom: '10px',
                            filter: selectedBlade === blade.name ? 'brightness(1.2)' : (isAvailable ? 'none' : 'grayscale(1)')
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
                    );
                  })}
                </div>

                {/* Selector de Ratchet */}
                <div>
                  <h4 style={{ color: '#333', marginBottom: '15px', textAlign: 'center' }}>🔩 Ratchet</h4>
                  {components.ratchets.map(ratchet => {
                    const count = getInventoryCount('ratchet', ratchet.name);
                    const isAvailable = count > 0;
                    
                    return (
                      <div 
                        key={ratchet.name}
                        onClick={() => isAvailable && setSelectedRatchet(ratchet.name)}
                        style={{
                          padding: '15px',
                          margin: '10px 0',
                          backgroundColor: selectedRatchet === ratchet.name ? '#ff6b35' : (isAvailable ? '#f8f9fa' : '#e9ecef'),
                          color: selectedRatchet === ratchet.name ? 'white' : (isAvailable ? '#333' : '#6c757d'),
                          border: `3px solid ${selectedRatchet === ratchet.name ? '#ff6b35' : (isAvailable ? '#dee2e6' : '#adb5bd')}`,
                          borderRadius: '12px',
                          cursor: isAvailable ? 'pointer' : 'not-allowed',
                          textAlign: 'center',
                          transition: 'all 0.3s',
                          boxShadow: selectedRatchet === ratchet.name ? '0 5px 15px rgba(255, 107, 53, 0.3)' : '0 2px 5px rgba(0,0,0,0.1)',
                          opacity: isAvailable ? 1 : 0.6,
                          position: 'relative'
                        }}
                      >
                        <div style={{
                          position: 'absolute',
                          top: '5px',
                          right: '10px',
                          background: isAvailable ? '#28a745' : '#dc3545',
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {count > 0 ? `x${count}` : 'x0'}
                        </div>
                        <img 
                          src={getImagePath(ratchet.image)} 
                          alt={ratchet.name}
                          style={{ 
                            width: '60px', 
                            height: '60px', 
                            marginBottom: '10px',
                            filter: selectedRatchet === ratchet.name ? 'brightness(1.2)' : (isAvailable ? 'none' : 'grayscale(1)')
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.fontSize = '2rem';
                          }}
                        />
                        <div style={{ fontSize: '1.5rem', display: 'none' }}>🔩</div>
                        <div><strong>{ratchet.name}</strong></div>
                      </div>
                    );
                  })}
                </div>

                {/* Selector de Bit */}
                <div>
                  <h4 style={{ color: '#333', marginBottom: '15px', textAlign: 'center' }}>⚡ Bit</h4>
                  {components.bits.map(bit => {
                    const count = getInventoryCount('bit', bit.name);
                    const isAvailable = count > 0;
                    
                    return (
                      <div 
                        key={bit.name}
                        onClick={() => isAvailable && setSelectedBit(bit.name)}
                        style={{
                          padding: '15px',
                          margin: '10px 0',
                          backgroundColor: selectedBit === bit.name ? '#ff6b35' : (isAvailable ? '#f8f9fa' : '#e9ecef'),
                          color: selectedBit === bit.name ? 'white' : (isAvailable ? '#333' : '#6c757d'),
                          border: `3px solid ${selectedBit === bit.name ? '#ff6b35' : (isAvailable ? '#dee2e6' : '#adb5bd')}`,
                          borderRadius: '12px',
                          cursor: isAvailable ? 'pointer' : 'not-allowed',
                          textAlign: 'center',
                          transition: 'all 0.3s',
                          boxShadow: selectedBit === bit.name ? '0 5px 15px rgba(255, 107, 53, 0.3)' : '0 2px 5px rgba(0,0,0,0.1)',
                          opacity: isAvailable ? 1 : 0.6,
                          position: 'relative'
                        }}
                      >
                        <div style={{
                          position: 'absolute',
                          top: '5px',
                          right: '10px',
                          background: isAvailable ? '#28a745' : '#dc3545',
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {count > 0 ? `x${count}` : 'x0'}
                        </div>
                        <img 
                          src={getImagePath(bit.image)} 
                          alt={bit.name}
                          style={{ 
                            width: '60px', 
                            height: '60px', 
                            marginBottom: '10px',
                            filter: selectedBit === bit.name ? 'brightness(1.2)' : (isAvailable ? 'none' : 'grayscale(1)')
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
                    );
                  })}
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
      )}

      {/* TAB DE INVENTARIO */}
      {activeTab === 'inventory' && (
        <div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '25px',
            borderRadius: '15px',
            marginBottom: '30px',
            color: '#333'
          }}>
            <h3 style={{ color: '#ff6b35', marginBottom: '20px', textAlign: 'center' }}>
              🎒 Mi Inventario de Piezas
            </h3>
            <p style={{ textAlign: 'center', marginBottom: '30px' }}>
              Gestiona las piezas que tienes disponibles. Agrega o remueve piezas de tu inventario.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px' }}>
              {/* Blades */}
              <div>
                <h4 style={{ textAlign: 'center', marginBottom: '15px' }}>⚔️ Blades</h4>
                {components.blades.map(blade => {
                  const count = getInventoryCount('blade', blade.name);
                  return (
                    <div key={blade.name} style={{
                      padding: '15px',
                      margin: '10px 0',
                      background: count > 0 ? '#f8f9fa' : '#fff',
                      border: `2px solid ${count > 0 ? '#28a745' : '#dee2e6'}`,
                      borderRadius: '10px',
                      textAlign: 'center'
                    }}>
                      <img 
                        src={getImagePath(blade.image)} 
                        alt={blade.name}
                        style={{ width: '50px', height: '50px', marginBottom: '10px' }}
                      />
                      <div><strong>{blade.name}</strong></div>
                      <div style={{ 
                        margin: '10px 0', 
                        fontSize: '18px', 
                        fontWeight: 'bold',
                        color: count > 0 ? '#28a745' : '#dc3545'
                      }}>
                        Cantidad: {count}
                      </div>
                      <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleAddToInventory('blade', blade.name)}
                          style={{
                            padding: '5px 10px',
                            background: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                        >
                          + Agregar
                        </button>
                        {count > 0 && (
                          <button
                            onClick={() => handleRemoveFromInventory('blade', blade.name)}
                            style={{
                              padding: '5px 10px',
                              background: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '5px',
                              cursor: 'pointer',
                              fontSize: '14px'
                            }}
                          >
                            - Quitar
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Ratchets */}
              <div>
                <h4 style={{ textAlign: 'center', marginBottom: '15px' }}>🔩 Ratchets</h4>
                {components.ratchets.map(ratchet => {
                  const count = getInventoryCount('ratchet', ratchet.name);
                  return (
                    <div key={ratchet.name} style={{
                      padding: '15px',
                      margin: '10px 0',
                      background: count > 0 ? '#f8f9fa' : '#fff',
                      border: `2px solid ${count > 0 ? '#28a745' : '#dee2e6'}`,
                      borderRadius: '10px',
                      textAlign: 'center'
                    }}>
                      <img 
                        src={getImagePath(ratchet.image)} 
                        alt={ratchet.name}
                        style={{ width: '50px', height: '50px', marginBottom: '10px' }}
                      />
                      <div><strong>{ratchet.name}</strong></div>
                      <div style={{ 
                        margin: '10px 0', 
                        fontSize: '18px', 
                        fontWeight: 'bold',
                        color: count > 0 ? '#28a745' : '#dc3545'
                      }}>
                        Cantidad: {count}
                      </div>
                      <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleAddToInventory('ratchet', ratchet.name)}
                          style={{
                            padding: '5px 10px',
                            background: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                        >
                          + Agregar
                        </button>
                        {count > 0 && (
                          <button
                            onClick={() => handleRemoveFromInventory('ratchet', ratchet.name)}
                            style={{
                              padding: '5px 10px',
                              background: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '5px',
                              cursor: 'pointer',
                              fontSize: '14px'
                            }}
                          >
                            - Quitar
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bits */}
              <div>
                <h4 style={{ textAlign: 'center', marginBottom: '15px' }}>⚡ Bits</h4>
                {components.bits.map(bit => {
                  const count = getInventoryCount('bit', bit.name);
                  return (
                    <div key={bit.name} style={{
                      padding: '15px',
                      margin: '10px 0',
                      background: count > 0 ? '#f8f9fa' : '#fff',
                      border: `2px solid ${count > 0 ? '#28a745' : '#dee2e6'}`,
                      borderRadius: '10px',
                      textAlign: 'center'
                    }}>
                      <img 
                        src={getImagePath(bit.image)} 
                        alt={bit.name}
                        style={{ width: '50px', height: '50px', marginBottom: '10px' }}
                      />
                      <div><strong>{bit.name}</strong></div>
                      <div style={{ 
                        margin: '10px 0', 
                        fontSize: '18px', 
                        fontWeight: 'bold',
                        color: count > 0 ? '#28a745' : '#dc3545'
                      }}>
                        Cantidad: {count}
                      </div>
                      <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleAddToInventory('bit', bit.name)}
                          style={{
                            padding: '5px 10px',
                            background: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                        >
                          + Agregar
                        </button>
                        {count > 0 && (
                          <button
                            onClick={() => handleRemoveFromInventory('bit', bit.name)}
                            style={{
                              padding: '5px 10px',
                              background: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '5px',
                              cursor: 'pointer',
                              fontSize: '14px'
                            }}
                          >
                            - Quitar
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB DE WISHLIST */}
      {activeTab === 'wishlist' && (
        <div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '25px',
            borderRadius: '15px',
            marginBottom: '30px',
            color: '#333'
          }}>
            <h3 style={{ color: '#ff6b35', marginBottom: '20px', textAlign: 'center' }}>
              ⭐ Mi Lista de Deseos
            </h3>
            <p style={{ textAlign: 'center', marginBottom: '30px' }}>
              Agrega las piezas que deseas conseguir. Marca su prioridad para organizarte mejor.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px' }}>
              {/* Blades */}
              <div>
                <h4 style={{ textAlign: 'center', marginBottom: '15px' }}>⚔️ Blades</h4>
                {components.blades.map(blade => {
                  const inWishlist = isInWishlist('blade', blade.name);
                  const wishlistItem = wishlist.items.find(item => item.type === 'blade' && item.name === blade.name);
                  
                  return (
                    <div key={blade.name} style={{
                      padding: '15px',
                      margin: '10px 0',
                      background: inWishlist ? '#fff3cd' : '#fff',
                      border: `2px solid ${inWishlist ? '#ffc107' : '#dee2e6'}`,
                      borderRadius: '10px',
                      textAlign: 'center'
                    }}>
                      <img 
                        src={getImagePath(blade.image)} 
                        alt={blade.name}
                        style={{ width: '50px', height: '50px', marginBottom: '10px' }}
                      />
                      <div><strong>{blade.name}</strong></div>
                      {inWishlist && wishlistItem && (
                        <div style={{ margin: '10px 0' }}>
                          <select
                            value={wishlistItem.priority}
                            onChange={(e) => handleUpdateWishlistPriority(wishlistItem._id, e.target.value)}
                            style={{
                              padding: '5px',
                              borderRadius: '5px',
                              border: '1px solid #ddd',
                              background: getPriorityColor(wishlistItem.priority),
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                          >
                            <option value="low">🔵 Baja</option>
                            <option value="medium">🟡 Media</option>
                            <option value="high">🔴 Alta</option>
                          </select>
                        </div>
                      )}
                      <div style={{ marginTop: '10px' }}>
                        {inWishlist ? (
                          <button
                            onClick={() => handleRemoveFromWishlist(wishlistItem._id)}
                            style={{
                              padding: '5px 10px',
                              background: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '5px',
                              cursor: 'pointer',
                              fontSize: '14px'
                            }}
                          >
                            ✕ Quitar
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAddToWishlist('blade', blade.name)}
                            style={{
                              padding: '5px 10px',
                              background: '#ffc107',
                              color: 'white',
                              border: 'none',
                              borderRadius: '5px',
                              cursor: 'pointer',
                              fontSize: '14px'
                            }}
                          >
                            ⭐ Agregar
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Ratchets */}
              <div>
                <h4 style={{ textAlign: 'center', marginBottom: '15px' }}>🔩 Ratchets</h4>
                {components.ratchets.map(ratchet => {
                  const inWishlist = isInWishlist('ratchet', ratchet.name);
                  const wishlistItem = wishlist.items.find(item => item.type === 'ratchet' && item.name === ratchet.name);
                  
                  return (
                    <div key={ratchet.name} style={{
                      padding: '15px',
                      margin: '10px 0',
                      background: inWishlist ? '#fff3cd' : '#fff',
                      border: `2px solid ${inWishlist ? '#ffc107' : '#dee2e6'}`,
                      borderRadius: '10px',
                      textAlign: 'center'
                    }}>
                      <img 
                        src={getImagePath(ratchet.image)} 
                        alt={ratchet.name}
                        style={{ width: '50px', height: '50px', marginBottom: '10px' }}
                      />
                      <div><strong>{ratchet.name}</strong></div>
                      {inWishlist && wishlistItem && (
                        <div style={{ margin: '10px 0' }}>
                          <select
                            value={wishlistItem.priority}
                            onChange={(e) => handleUpdateWishlistPriority(wishlistItem._id, e.target.value)}
                            style={{
                              padding: '5px',
                              borderRadius: '5px',
                              border: '1px solid #ddd',
                              background: getPriorityColor(wishlistItem.priority),
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                          >
                            <option value="low">🔵 Baja</option>
                            <option value="medium">🟡 Media</option>
                            <option value="high">🔴 Alta</option>
                          </select>
                        </div>
                      )}
                      <div style={{ marginTop: '10px' }}>
                        {inWishlist ? (
                          <button
                            onClick={() => handleRemoveFromWishlist(wishlistItem._id)}
                            style={{
                              padding: '5px 10px',
                              background: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '5px',
                              cursor: 'pointer',
                              fontSize: '14px'
                            }}
                          >
                            ✕ Quitar
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAddToWishlist('ratchet', ratchet.name)}
                            style={{
                              padding: '5px 10px',
                              background: '#ffc107',
                              color: 'white',
                              border: 'none',
                              borderRadius: '5px',
                              cursor: 'pointer',
                              fontSize: '14px'
                            }}
                          >
                            ⭐ Agregar
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bits */}
              <div>
                <h4 style={{ textAlign: 'center', marginBottom: '15px' }}>⚡ Bits</h4>
                {components.bits.map(bit => {
                  const inWishlist = isInWishlist('bit', bit.name);
                  const wishlistItem = wishlist.items.find(item => item.type === 'bit' && item.name === bit.name);
                  
                  return (
                    <div key={bit.name} style={{
                      padding: '15px',
                      margin: '10px 0',
                      background: inWishlist ? '#fff3cd' : '#fff',
                      border: `2px solid ${inWishlist ? '#ffc107' : '#dee2e6'}`,
                      borderRadius: '10px',
                      textAlign: 'center'
                    }}>
                      <img 
                        src={getImagePath(bit.image)} 
                        alt={bit.name}
                        style={{ width: '50px', height: '50px', marginBottom: '10px' }}
                      />
                      <div><strong>{bit.name}</strong></div>
                      {inWishlist && wishlistItem && (
                        <div style={{ margin: '10px 0' }}>
                          <select
                            value={wishlistItem.priority}
                            onChange={(e) => handleUpdateWishlistPriority(wishlistItem._id, e.target.value)}
                            style={{
                              padding: '5px',
                              borderRadius: '5px',
                              border: '1px solid #ddd',
                              background: getPriorityColor(wishlistItem.priority),
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                          >
                            <option value="low">🔵 Baja</option>
                            <option value="medium">🟡 Media</option>
                            <option value="high">🔴 Alta</option>
                          </select>
                        </div>
                      )}
                      <div style={{ marginTop: '10px' }}>
                        {inWishlist ? (
                          <button
                            onClick={() => handleRemoveFromWishlist(wishlistItem._id)}
                            style={{
                              padding: '5px 10px',
                              background: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '5px',
                              cursor: 'pointer',
                              fontSize: '14px'
                            }}
                          >
                            ✕ Quitar
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAddToWishlist('bit', bit.name)}
                            style={{
                              padding: '5px 10px',
                              background: '#ffc107',
                              color: 'white',
                              border: 'none',
                              borderRadius: '5px',
                              cursor: 'pointer',
                              fontSize: '14px'
                            }}
                          >
                            ⭐ Agregar
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {wishlist.items.length === 0 && (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px',
                marginTop: '30px',
                background: 'rgba(255, 193, 7, 0.1)',
                borderRadius: '10px'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '15px' }}>⭐</div>
                <h4>Tu wishlist está vacía</h4>
                <p>¡Agrega las piezas que deseas conseguir!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Garage;