const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Registrar usuario
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'El usuario o email ya existe' 
      });
    }

    // Crear nuevo usuario
    const user = new User({ username, email, password });
    await user.save();

    // Generar JWT
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        level: user.level,
        wins: user.wins,
        losses: user.losses
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt:', { email, password }); // LOG
    
    // Buscar usuario
    const user = await User.findOne({ email });
    console.log('User found:', user ? 'YES' : 'NO'); // LOG
    console.log('Email in DB:', user ? user.email : 'N/A'); // LOG
    
    if (!user) {
      console.log('User not found in database'); // LOG
      return res.status(400).json({ 
        message: 'Credenciales inválidas' 
      });
    }

    // Verificar password
    const isMatch = await user.matchPassword(password);
    console.log('Password match:', isMatch); // LOG
    console.log('Plain password received:', password); // LOG TEMPORAL
    
    if (!isMatch) {
      console.log('Password does not match'); // LOG
      return res.status(400).json({ 
        message: 'Credenciales inválidas' 
      });
    }

    // Generar JWT
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    console.log('Login successful for user:', user.email); // LOG

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        level: user.level,
        wins: user.wins,
        losses: user.losses
      }
    });

  } catch (error) {
    console.error('Login error:', error); // LOG
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;