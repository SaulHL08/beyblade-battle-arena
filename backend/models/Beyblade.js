const mongoose = require('mongoose');

const beybladeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
  },
  blade: {
    type: String,
    required: true,
    enum: [
      'DranSword', 
      'DranDagger', 
      'DranBuster',
      'KnightShield',    // NUEVO
      'WizardArrow',     // NUEVO
      'HellsScythe'      // NUEVO
    ]
  },
  ratchet: {
    type: String,
    required: true,
    enum: [
      '3-60', 
      '4-60', 
      '1-60',
      '3-80',           // NUEVO
      '4-80',           // NUEVO
      '4-60R'           // NUEVO
    ]
  },
  bit: {
    type: String,
    required: true,
    enum: [
      'Flat', 
      'Rush', 
      'Accel',
      'Needle',         // NUEVO
      'Ball',           // NUEVO
      'Taper'           // NUEVO
    ]
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
  const attackValues = { 
    'DranSword': 90, 
    'DranDagger': 75, 
    'DranBuster': 85,
    'KnightShield': 70,   // Balanceado en defensa
    'WizardArrow': 95,    // Alto ataque
    'HellsScythe': 88     // Ataque medio-alto
  };
  
  const defenseValues = { 
    'DranSword': 60, 
    'DranDagger': 80, 
    'DranBuster': 95,
    'KnightShield': 98,   // Máxima defensa
    'WizardArrow': 55,    // Baja defensa
    'HellsScythe': 72     // Defensa media
  };
  
  const staminaValues = { 
    'Flat': 60, 
    'Rush': 85, 
    'Accel': 70,
    'Needle': 95,         // Alto stamina
    'Ball': 80,           // Medio-alto stamina
    'Taper': 65           // Medio stamina
  };
  
  this.attack = attackValues[this.blade] || 70;
  this.defense = defenseValues[this.blade] || 70;
  this.stamina = staminaValues[this.bit] || 70;
  
  next();
});

module.exports = mongoose.model('Beyblade', beybladeSchema);