const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Servir archivos estáticos de las imágenes subidas
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/garage', require('./routes/garage'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/tournaments', require('./routes/tournaments'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/wishlist', require('./routes/wishlist')); // ← NUEVA LÍNEA

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Beyblade Battle Arena Backend funcionando!' });
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Conectado a MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Error conectando a MongoDB:', err);
  });