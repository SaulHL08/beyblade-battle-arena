const express = require('express');
const Wishlist = require('../models/Wishlist');
const auth = require('../middleware/auth');
const router = express.Router();

// Obtener wishlist del usuario
router.get('/', auth, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ userId: req.userId });
    
    // Si no existe, crear una vacía
    if (!wishlist) {
      wishlist = new Wishlist({
        userId: req.userId,
        items: []
      });
      await wishlist.save();
    }
    
    res.json(wishlist);
  } catch (error) {
    console.error('Error obteniendo wishlist:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Agregar item a wishlist
router.post('/add', auth, async (req, res) => {
  try {
    const { type, name, priority } = req.body;
    
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
    
    let wishlist = await Wishlist.findOne({ userId: req.userId });
    
    if (!wishlist) {
      wishlist = new Wishlist({ userId: req.userId });
    }
    
    await wishlist.addItem(type, name, priority || 'medium');
    
    res.json({
      message: 'Item agregado a la wishlist',
      wishlist
    });
    
  } catch (error) {
    console.error('Error agregando item a wishlist:', error);
    res.status(400).json({ 
      message: error.message || 'Error del servidor' 
    });
  }
});

// Remover item de wishlist
router.delete('/remove/:itemId', auth, async (req, res) => {
  try {
    const { itemId } = req.params;
    
    const wishlist = await Wishlist.findOne({ userId: req.userId });
    
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist no encontrada' });
    }
    
    await wishlist.removeItem(itemId);
    
    res.json({
      message: 'Item removido de la wishlist',
      wishlist
    });
    
  } catch (error) {
    console.error('Error removiendo item de wishlist:', error);
    res.status(400).json({ 
      message: error.message || 'Error del servidor' 
    });
  }
});

// Actualizar prioridad de item
router.patch('/priority/:itemId', auth, async (req, res) => {
  try {
    const { itemId } = req.params;
    const { priority } = req.body;
    
    if (!['low', 'medium', 'high'].includes(priority)) {
      return res.status(400).json({ message: 'Prioridad inválida' });
    }
    
    const wishlist = await Wishlist.findOne({ userId: req.userId });
    
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist no encontrada' });
    }
    
    await wishlist.updatePriority(itemId, priority);
    
    res.json({
      message: 'Prioridad actualizada',
      wishlist
    });
    
  } catch (error) {
    console.error('Error actualizando prioridad:', error);
    res.status(400).json({ 
      message: error.message || 'Error del servidor' 
    });
  }
});

module.exports = router;