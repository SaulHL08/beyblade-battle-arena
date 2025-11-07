const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Tournament = require('../models/Tournament');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Configuración de multer para imágenes de torneos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/tournaments/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    cb(null, `tournament-${uniqueSuffix}${fileExtension}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  }
});

// Obtener todos los torneos (público)
router.get('/', async (req, res) => {
  try {
    const { status, upcoming } = req.query;
    
    let query = {};
    
    // Filtrar por estado
    if (status) {
      query.status = status;
    }
    
    // Filtrar solo próximos eventos
    if (upcoming === 'true') {
      query.date = { $gte: new Date() };
      query.status = 'upcoming';
    }
    
    const tournaments = await Tournament.find(query)
      .populate('userId', 'username profileImage')
      .sort({ date: 1, createdAt: -1 });
    
    res.json(tournaments);
  } catch (error) {
    console.error('Error obteniendo torneos:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Obtener un torneo específico
router.get('/:id', async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate('userId', 'username profileImage level')
      .populate('participants', 'username profileImage level');
    
    if (!tournament) {
      return res.status(404).json({ message: 'Torneo no encontrado' });
    }
    
    res.json(tournament);
  } catch (error) {
    console.error('Error obteniendo torneo:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Crear nuevo torneo (requiere autenticación)
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { name, description, date, time, location } = req.body;
    
    // Obtener info del usuario
    const user = await User.findById(req.userId);
    
    const tournamentData = {
      userId: req.userId,
      name,
      description,
      date,
      time,
      location,
      createdBy: {
        username: user.username,
        profileImage: user.profileImage
      }
    };
    
    // Si se subió una imagen
    if (req.file) {
      tournamentData.image = `uploads/tournaments/${req.file.filename}`;
    }
    
    const tournament = new Tournament(tournamentData);
    await tournament.save();
    
    res.status(201).json({
      message: 'Torneo creado exitosamente',
      tournament
    });
    
  } catch (error) {
    console.error('Error creando torneo:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Actualizar torneo (solo el creador)
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    
    if (!tournament) {
      return res.status(404).json({ message: 'Torneo no encontrado' });
    }
    
    // Verificar que sea el creador
    if (tournament.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'No autorizado' });
    }
    
    const { name, description, date, time, location, status } = req.body;
    
    if (name) tournament.name = name;
    if (description) tournament.description = description;
    if (date) tournament.date = date;
    if (time) tournament.time = time;
    if (location) tournament.location = location;
    if (status) tournament.status = status;
    
    // Si se subió una nueva imagen
    if (req.file) {
      // Eliminar imagen anterior si existe
      if (tournament.image) {
        const oldImagePath = path.join(__dirname, '..', tournament.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      tournament.image = `uploads/tournaments/${req.file.filename}`;
    }
    
    await tournament.save();
    
    res.json({
      message: 'Torneo actualizado exitosamente',
      tournament
    });
    
  } catch (error) {
    console.error('Error actualizando torneo:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Eliminar torneo (solo el creador)
router.delete('/:id', auth, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    
    if (!tournament) {
      return res.status(404).json({ message: 'Torneo no encontrado' });
    }
    
    // Verificar que sea el creador
    if (tournament.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'No autorizado' });
    }
    
    // Eliminar imagen si existe
    if (tournament.image) {
      const imagePath = path.join(__dirname, '..', tournament.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await Tournament.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Torneo eliminado exitosamente' });
    
  } catch (error) {
    console.error('Error eliminando torneo:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Unirse a un torneo
router.post('/:id/join', auth, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    
    if (!tournament) {
      return res.status(404).json({ message: 'Torneo no encontrado' });
    }
    
    // Verificar si ya está inscrito
    if (tournament.participants.includes(req.userId)) {
      return res.status(400).json({ message: 'Ya estás inscrito en este torneo' });
    }
    
    tournament.participants.push(req.userId);
    await tournament.save();
    
    res.json({
      message: 'Te has unido al torneo exitosamente',
      tournament
    });
    
  } catch (error) {
    console.error('Error uniéndose al torneo:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Salir de un torneo
router.post('/:id/leave', auth, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    
    if (!tournament) {
      return res.status(404).json({ message: 'Torneo no encontrado' });
    }
    
    tournament.participants = tournament.participants.filter(
      p => p.toString() !== req.userId
    );
    
    await tournament.save();
    
    res.json({
      message: 'Has salido del torneo',
      tournament
    });
    
  } catch (error) {
    console.error('Error saliendo del torneo:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;