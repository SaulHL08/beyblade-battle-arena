const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const Inventory = require('../models/Inventory');
const jwt = require('jsonwebtoken');

// Crear app de Express para testing
const app = express();
app.use(express.json());

// Mock del middleware de autenticación
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No autorizado' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test_secret');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};

// Importar y configurar rutas DESPUÉS de definir el middleware
const inventoryRouter = express.Router();

// Copiar las rutas de inventory.js aquí con el middleware mock
inventoryRouter.get('/', authMiddleware, async (req, res) => {
  try {
    let inventory = await Inventory.findOne({ userId: req.userId });
    
    if (!inventory) {
      inventory = new Inventory({
        userId: req.userId,
        items: []
      });
      await inventory.save();
    }
    
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

inventoryRouter.post('/add', authMiddleware, async (req, res) => {
  try {
    const { type, name, quantity } = req.body;
    
    if (!['blade', 'ratchet', 'bit'].includes(type)) {
      return res.status(400).json({ message: 'Tipo de item inválido' });
    }
    
    const validItems = {
      blade: ['DranSword', 'DranDagger', 'DranBuster', 'KnightShield', 'WizardArrow', 'HellsScythe'],
      ratchet: ['3-60', '4-60', '1-60', '3-80', '4-80', '4-60R'],
      bit: ['Flat', 'Rush', 'Accel', 'Needle', 'Ball', 'Taper']
    };
    
    if (!validItems[type].includes(name)) {
      return res.status(400).json({ message: 'Nombre de item inválido' });
    }
    
    let inventory = await Inventory.findOne({ userId: req.userId });
    
    if (!inventory) {
      inventory = new Inventory({ userId: req.userId });
    }
    
    await inventory.addItem(type, name, quantity || 1);
    
    res.json({ message: 'Item agregado al inventario', inventory });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Error del servidor' });
  }
});

inventoryRouter.post('/remove', authMiddleware, async (req, res) => {
  try {
    const { type, name, quantity } = req.body;
    
    const inventory = await Inventory.findOne({ userId: req.userId });
    
    if (!inventory) {
      return res.status(404).json({ message: 'Inventario no encontrado' });
    }
    
    await inventory.removeItem(type, name, quantity || 1);
    
    res.json({ message: 'Item removido del inventario', inventory });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Error del servidor' });
  }
});

inventoryRouter.post('/check', authMiddleware, async (req, res) => {
  try {
    const { blade, ratchet, bit } = req.body;
    
    const inventory = await Inventory.findOne({ userId: req.userId });
    
    if (!inventory) {
      return res.json({ available: false });
    }
    
    const hasAllPieces = 
      inventory.hasItem('blade', blade) &&
      inventory.hasItem('ratchet', ratchet) &&
      inventory.hasItem('bit', bit);
    
    res.json({ available: hasAllPieces });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

app.use('/api/inventory', inventoryRouter);

let mongoServer;
let testUserId;
let testToken;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
  
  testUserId = new mongoose.Types.ObjectId();
  testToken = jwt.sign(
    { userId: testUserId }, 
    'test_secret',
    { expiresIn: '1h' }
  );
});

afterEach(async () => {
  await Inventory.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Inventory API Routes Tests', () => {
  
  test('GET / debe retornar o crear inventario del usuario', async () => {
    const response = await request(app)
      .get('/api/inventory')
      .set('Authorization', `Bearer ${testToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('userId');
    expect(response.body).toHaveProperty('items');
  });
  
  test('POST /add debe agregar un item válido', async () => {
    const response = await request(app)
      .post('/api/inventory/add')
      .set('Authorization', `Bearer ${testToken}`)
      .send({ type: 'blade', name: 'DranSword', quantity: 2 });
    
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Item agregado al inventario');
  });
  
  test('ERROR: POST /add debe rechazar tipo inválido', async () => {
    const response = await request(app)
      .post('/api/inventory/add')
      .set('Authorization', `Bearer ${testToken}`)
      .send({ type: 'invalid', name: 'DranSword', quantity: 1 });
    
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Tipo de item inválido');
  });
  
  test('ERROR: POST /add debe rechazar nombre inválido', async () => {
    const response = await request(app)
      .post('/api/inventory/add')
      .set('Authorization', `Bearer ${testToken}`)
      .send({ type: 'blade', name: 'InvalidBlade', quantity: 1 });
    
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Nombre de item inválido');
  });
  
  test('POST /remove debe remover item existente', async () => {
    await Inventory.create({
      userId: testUserId,
      items: [{ type: 'blade', name: 'DranSword', quantity: 5 }]
    });
    
    const response = await request(app)
      .post('/api/inventory/remove')
      .set('Authorization', `Bearer ${testToken}`)
      .send({ type: 'blade', name: 'DranSword', quantity: 2 });
    
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Item removido del inventario');
  });
  
  test('ERROR: Debe rechazar request sin token', async () => {
    const response = await request(app)
      .get('/api/inventory');
    
    expect(response.status).toBe(401);
  });
  
  test('POST /check debe verificar disponibilidad correctamente', async () => {
    await Inventory.create({
      userId: testUserId,
      items: [
        { type: 'blade', name: 'DranSword', quantity: 1 },
        { type: 'ratchet', name: '3-60', quantity: 1 },
        { type: 'bit', name: 'Flat', quantity: 1 }
      ]
    });
    
    const response = await request(app)
      .post('/api/inventory/check')
      .set('Authorization', `Bearer ${testToken}`)
      .send({ blade: 'DranSword', ratchet: '3-60', bit: 'Flat' });
    
    expect(response.status).toBe(200);
    expect(response.body.available).toBe(true);
  });
});