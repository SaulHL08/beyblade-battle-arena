const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  
  // Campos específicos del juego
  level: {
    type: Number,
    default: 1
  },
  wins: {
    type: Number,
    default: 0
  },
  losses: {
    type: Number,
    default: 0
  },
  // Nuevos campos para el perfil
  profileImage: {
    type: String,
    default: null // URL o path de la imagen de perfil
  },
  coverImage: {
    type: String,
    default: null // URL o path de la imagen de portada
  },
  bio: {
    type: String,
    maxlength: 200,
    default: ''
  },
  favoriteBeyblade: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Beyblade',
    default: null
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  achievements: [{
    name: String,
    description: String,
    icon: String,
    unlockedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Encriptar password antes de guardar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Método para comparar passwords
userSchema.methods.matchPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Método para calcular estadísticas
userSchema.methods.getStats = function() {
  const totalBattles = this.wins + this.losses;
  const winRate = totalBattles > 0 ? ((this.wins / totalBattles) * 100).toFixed(1) : 0;
  
  return {
    totalBattles,
    winRate,
    level: this.level,
    wins: this.wins,
    losses: this.losses
  };
};

// Método para obtener logros automáticos
userSchema.methods.getAchievements = function() {
  const achievements = [...this.achievements];
  
  // Logros automáticos basados en estadísticas
  if (this.wins >= 1 && !achievements.find(a => a.name === 'Primera Victoria')) {
    achievements.push({
      name: 'Primera Victoria',
      description: '¡Has ganado tu primera batalla!',
      icon: '🏆',
      unlockedAt: new Date()
    });
  }
  
  if (this.wins >= 10 && !achievements.find(a => a.name === 'Guerrero Experimentado')) {
    achievements.push({
      name: 'Guerrero Experimentado',
      description: 'Has ganado 10 batallas',
      icon: '⚔️',
      unlockedAt: new Date()
    });
  }
  
  if (this.level >= 5 && !achievements.find(a => a.name === 'Veterano')) {
    achievements.push({
      name: 'Veterano',
      description: 'Has alcanzado el nivel 5',
      icon: '🎖️',
      unlockedAt: new Date()
    });
  }
  
  return achievements;
};

module.exports = mongoose.model('User', userSchema);