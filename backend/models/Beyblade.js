const mongoose = require('mongoose');

const beybladeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    // Quitamos required: true porque se genera automáticamente
  },
  blade: {
    type: String,
    required: true,
    enum: ['DranSword', 'DranDagger', 'DranBuster']
  },
  ratchet: {
    type: String,
    required: true,
    enum: ['3-60', '4-60', '1-60']
  },
  bit: {
    type: String,
    required: true,
    enum: ['Flat', 'Rush', 'Accel']
  },
  attack: {
    type: Number,
    default: 70
  },
  defense: {
    type: Number,
    default: 70
  },
  stamina: {
    type: Number,
    default: 70
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generar nombre y estadísticas antes de guardar
beybladeSchema.pre('save', function(next) {
  // Generar nombre automáticamente
  this.name = `${this.blade} ${this.ratchet} ${this.bit}`;
  
  // Calcular estadísticas basadas en componentes
  const attackValues = { 'DranSword': 90, 'DranDagger': 75, 'DranBuster': 85 };
  const defenseValues = { 'DranSword': 60, 'DranDagger': 80, 'DranBuster': 95 };
  const staminaValues = { 'Flat': 60, 'Rush': 85, 'Accel': 70 };
  
  this.attack = attackValues[this.blade] || 70;
  this.defense = defenseValues[this.blade] || 70;
  this.stamina = staminaValues[this.bit] || 70;
  
  next();
});

module.exports = mongoose.model('Beyblade', beybladeSchema);