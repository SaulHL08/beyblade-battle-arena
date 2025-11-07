const express = require('express');
const Beyblade = require('../models/Beyblade');
const auth = require('../middleware/auth');
const router = express.Router();

// Obtener todos los Beyblades del usuario
router.get('/', auth, async (req, res) => {
  try {
    const beyblades = await Beyblade.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(beyblades);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Crear nuevo Beyblade
router.post('/', auth, async (req, res) => {
  try {
    const { blade, ratchet, bit } = req.body;

    // Verificar límite de 3 Beyblades por usuario
    const userBeyblades = await Beyblade.countDocuments({ userId: req.userId });
    if (userBeyblades >= 3) {
      return res.status(400).json({ message: 'Máximo 3 Beyblades permitidos por usuario' });
    }

    // Verificar que no exista la misma combinación para este usuario
    const existingBeyblade = await Beyblade.findOne({
      userId: req.userId,
      blade,
      ratchet,
      bit
    });

    if (existingBeyblade) {
      return res.status(400).json({ message: 'Ya tienes un Beyblade con esta combinación' });
    }

    const beyblade = new Beyblade({
      userId: req.userId,
      blade,
      ratchet,
      bit
    });

    await beyblade.save();

    res.status(201).json({
      message: 'Beyblade creado exitosamente',
      beyblade
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Eliminar Beyblade
router.delete('/:id', auth, async (req, res) => {
  try {
    const beyblade = await Beyblade.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!beyblade) {
      return res.status(404).json({ message: 'Beyblade no encontrado' });
    }

    await Beyblade.findByIdAndDelete(req.params.id);

    res.json({ message: 'Beyblade eliminado exitosamente' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Obtener componentes disponibles
router.get('/components', (req, res) => {
  res.json({
    blades: [
      // Originales
      { name: 'DranSword', image: 'BladeDranSword.png', attack: 90, defense: 60 },
      { name: 'DranDagger', image: 'BladeDranDagger.png', attack: 75, defense: 80 },
      { name: 'DranBuster', image: 'BladeDranBuster.png', attack: 85, defense: 95 },
      // Nuevas
      { name: 'KnightShield', image: 'BladeKnightShield.png', attack: 70, defense: 98 },
      { name: 'WizardArrow', image: 'BladeWizardArrow.png', attack: 95, defense: 55 },
      { name: 'HellsScythe', image: 'BladeHellsScythe.png', attack: 88, defense: 72 }
    ],
    ratchets: [
      // Originales
      { name: '3-60', image: 'Ratchet3-60.png' },
      { name: '4-60', image: 'Ratchet4-60.png' },
      { name: '1-60', image: 'Ratchet1-60.png' },
      // Nuevas
      { name: '3-80', image: 'Ratchet3-80.png' },
      { name: '4-80', image: 'Ratchet4-80.png' },
      { name: '4-60R', image: 'Ratchet4-60R.png' }
    ],
    bits: [
      // Originales
      { name: 'Flat', image: 'BitFlat.png', stamina: 60 },
      { name: 'Rush', image: 'BitRush.png', stamina: 85 },
      { name: 'Accel', image: 'BitAccel.png', stamina: 70 },
      // Nuevas
      { name: 'Needle', image: 'BitNeedle.png', stamina: 95 },
      { name: 'Ball', image: 'BitBall.png', stamina: 80 },
      { name: 'Taper', image: 'BitTaper.png', stamina: 65 }
    ]
  });
});

module.exports = router;