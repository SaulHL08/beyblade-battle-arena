const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['blade', 'ratchet', 'bit']
  },
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    default: 1,
    min: 0
  }
});

const inventorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [inventoryItemSchema],
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
inventorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Método para agregar item
inventorySchema.methods.addItem = function(type, name, quantity = 1) {
  const existingItem = this.items.find(item => 
    item.type === type && item.name === name
  );
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.items.push({ type, name, quantity });
  }
  
  return this.save();
};

// Método para remover item
inventorySchema.methods.removeItem = function(type, name, quantity = 1) {
  const existingItem = this.items.find(item => 
    item.type === type && item.name === name
  );
  
  if (!existingItem) {
    throw new Error('Item no encontrado en el inventario');
  }
  
  existingItem.quantity -= quantity;
  
  if (existingItem.quantity <= 0) {
    this.items = this.items.filter(item => 
      !(item.type === type && item.name === name)
    );
  }
  
  return this.save();
};

// Método para verificar disponibilidad
inventorySchema.methods.hasItem = function(type, name, quantity = 1) {
  const item = this.items.find(item => 
    item.type === type && item.name === name
  );
  
  return item && item.quantity >= quantity;
};

module.exports = mongoose.model('Inventory', inventorySchema);