const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Beyblade = require('../models/Beyblade');
const auth = require('../middleware/auth');
const router = express.Router();

// Configuración de multer para subida de imágenes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/profiles/';
    // Crear directorio si no existe
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    cb(null, `${req.userId}-${file.fieldname}-${uniqueSuffix}${fileExtension}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Permitir solo imágenes
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

// Obtener perfil completo del usuario
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select('-password')
      .populate('favoriteBeyblade');
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Obtener todos los Beyblades del usuario
    const beyblades = await Beyblade.find({ userId: req.userId }).sort({ createdAt: -1 });
    
    // Calcular estadísticas adicionales
    const stats = user.getStats();
    const achievements = user.getAchievements();
    
    // Calcular tiempo como miembro
    const memberSince = Math.floor((new Date() - user.joinDate) / (1000 * 60 * 60 * 24));
    
    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        profileImage: user.profileImage,
        coverImage: user.coverImage,
        level: user.level,
        wins: user.wins,
        losses: user.losses,
        joinDate: user.joinDate,
        lastLogin: user.lastLogin,
        memberSince: memberSince,
        favoriteBeyblade: user.favoriteBeyblade
      },
      beyblades,
      stats,
      achievements
    });

  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Actualizar información del perfil
router.put('/', auth, async (req, res) => {
  try {
    const { bio, favoriteBeyblade } = req.body;
    
    const updateData = {};
    if (bio !== undefined) updateData.bio = bio;
    if (favoriteBeyblade) updateData.favoriteBeyblade = favoriteBeyblade;
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password').populate('favoriteBeyblade');

    res.json({
      message: 'Perfil actualizado exitosamente',
      user
    });

  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Subir imagen de perfil
router.post('/upload-profile-image', auth, upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se proporcionó imagen' });
    }

    const user = await User.findById(req.userId);
    
    // Eliminar imagen anterior si existe
    if (user.profileImage) {
      const oldImagePath = path.join(__dirname, '..', user.profileImage);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Actualizar ruta de imagen en BD
    const imagePath = `uploads/profiles/${req.file.filename}`;
    user.profileImage = imagePath;
    await user.save();

    res.json({
      message: 'Imagen de perfil actualizada exitosamente',
      profileImage: imagePath
    });

  } catch (error) {
    console.error('Error subiendo imagen de perfil:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Subir imagen de portada
router.post('/upload-cover-image', auth, upload.single('coverImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se proporcionó imagen' });
    }

    const user = await User.findById(req.userId);
    
    // Eliminar imagen anterior si existe
    if (user.coverImage) {
      const oldImagePath = path.join(__dirname, '..', user.coverImage);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Actualizar ruta de imagen en BD
    const imagePath = `uploads/profiles/${req.file.filename}`;
    user.coverImage = imagePath;
    await user.save();

    res.json({
      message: 'Imagen de portada actualizada exitosamente',
      coverImage: imagePath
    });

  } catch (error) {
    console.error('Error subiendo imagen de portada:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Obtener perfil público de otro usuario (por username)
router.get('/public/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password -email')
      .populate('favoriteBeyblade');
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Obtener Beyblades públicos
    const beyblades = await Beyblade.find({ userId: user._id }).sort({ createdAt: -1 });
    
    const stats = user.getStats();
    const achievements = user.getAchievements();
    const memberSince = Math.floor((new Date() - user.joinDate) / (1000 * 60 * 60 * 24));
    
    res.json({
      user: {
        id: user._id,
        username: user.username,
        bio: user.bio,
        profileImage: user.profileImage,
        coverImage: user.coverImage,
        level: user.level,
        wins: user.wins,
        losses: user.losses,
        joinDate: user.joinDate,
        memberSince: memberSince,
        favoriteBeyblade: user.favoriteBeyblade
      },
      beyblades,
      stats,
      achievements
    });

  } catch (error) {
    console.error('Error obteniendo perfil público:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Middleware para manejar errores de multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'El archivo es demasiado grande. Máximo 5MB.' });
    }
  }
  if (error.message === 'Solo se permiten archivos de imagen') {
    return res.status(400).json({ message: error.message });
  }
  next(error);
});

module.exports = router;