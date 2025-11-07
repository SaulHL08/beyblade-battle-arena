const express = require('express');
const Inventory = require('../models/Inventory');
const auth = require('../middleware/auth');
const router = express.Router();

// Obtener inventario del usuario
router.get('/', auth, async (req, res) => {
  try {
    let inventory = await Inventory.findOne({ userId: req.userId });
    
    // Si no existe, crear uno nuevo con items iniciales
    if (!inventory) {
      inventory = new Inventory({
        userId: req.userId,
        items: [
          // Piezas iniciales gratuitas
          { type: 'blade', name: 'DranSword', quantity: 1 },
          { type: 'ratchet', name: '3-60', quantity: 1 },
          { type: 'bit', name: 'Flat', quantity: 1 }
        ]
      });
      await inventory.save();
    }
    
    res.json(inventory);
  } catch (error) {
    console.error('Error obteniendo inventario:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Agregar item al inventario
router.post('/add', auth, async (req, res) => {
  try {
    const { type, name, quantity } = req.body;
    
    // Validar tipo
    if (!['blade', 'ratchet', 'bit'].includes(type)) {
      return res.status(400).json({ message: 'Tipo de item inválido' });
    }
    
    // Validar nombre según tipo
    const validItems = {
      blade: ['DranSword', 'DranDagger', 'DranBuster', 'KnightShield', 'WizardArrow', 'HellsScythe'],
      ratchet: ['3-60', '4-60', '1-60', '3-80', '4-80', '4-60R'],
      bit: ['Flat', 'Rush', 'Accel', 'Needle', 'Ball', 'Taper']
    };
    
    if (!validItems[type].includes(name)) {
      return res.status(400).json({ message: 'Nombre de item inválido' });
    }
    
    let inventory = await Inventory.findOne({ userId: req.userId });
    
    if (!inventory) {
      inventory = new Inventory({ userId: req.userId });
    }
    
    await inventory.addItem(type, name, quantity || 1);
    
    res.json({
      message: 'Item agregado al inventario',
      inventory
    });
    
  } catch (error) {
    console.error('Error agregando item:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Remover item del inventario
router.post('/remove', auth, async (req, res) => {
  try {
    const { type, name, quantity } = req.body;
    
    const inventory = await Inventory.findOne({ userId: req.userId });
    
    if (!inventory) {
      return res.status(404).json({ message: 'Inventario no encontrado' });
    }
    
    await inventory.removeItem(type, name, quantity || 1);
    
    res.json({
      message: 'Item removido del inventario',
      inventory
    });
    
  } catch (error) {
    console.error('Error removiendo item:', error);
    res.status(400).json({ 
      message: error.message || 'Error del servidor' 
    });
  }
});

// Verificar disponibilidad de items
router.post('/check', auth, async (req, res) => {
  try {
    const { blade, ratchet, bit } = req.body;
    
    const inventory = await Inventory.findOne({ userId: req.userId });
    
    if (!inventory) {
      return res.json({ available: false });
    }
    
    const hasAllPieces = 
      inventory.hasItem('blade', blade) &&
      inventory.hasItem('ratchet', ratchet) &&
      inventory.hasItem('bit', bit);
    
    res.json({ available: hasAllPieces });
    
  } catch (error) {
    console.error('Error verificando disponibilidad:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;