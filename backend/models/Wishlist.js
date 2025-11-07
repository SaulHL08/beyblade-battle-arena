const mongoose = require('mongoose');

const wishlistItemSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['blade', 'ratchet', 'bit']
  },
  name: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [wishlistItemSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Actualizar fecha de modificación
wishlistSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Método para agregar item
wishlistSchema.methods.addItem = function(type, name, priority = 'medium') {
  // Verificar si ya existe
  const existingItem = this.items.find(item => 
    item.type === type && item.name === name
  );
  
  if (existingItem) {
    throw new Error('Este item ya está en tu wishlist');
  }
  
  this.items.push({ type, name, priority });
  return this.save();
};

// Método para remover item
wishlistSchema.methods.removeItem = function(itemId) {
  this.items = this.items.filter(item => 
    item._id.toString() !== itemId.toString()
  );
  return this.save();
};

// Método para actualizar prioridad
wishlistSchema.methods.updatePriority = function(itemId, priority) {
  const item = this.items.find(item => 
    item._id.toString() === itemId.toString()
  );
  
  if (!item) {
    throw new Error('Item no encontrado');
  }
  
  item.priority = priority;
  return this.save();
};

module.exports = mongoose.model('Wishlist', wishlistSchema);