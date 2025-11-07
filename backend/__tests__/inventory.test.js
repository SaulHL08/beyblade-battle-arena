const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Inventory = require('../models/Inventory');

let mongoServer;

// Configurar antes de todas las pruebas
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

// Limpiar después de cada prueba
afterEach(async () => {
  await Inventory.deleteMany({});
});

// Desconectar al finalizar
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Inventory Model Tests', () => {
  
  // ✅ CASO 1: Crear inventario
  test('Debe crear un inventario nuevo', async () => {
    const inventory = new Inventory({
      userId: new mongoose.Types.ObjectId(),
      items: [{ type: 'blade', name: 'DranSword', quantity: 1 }]
    });
    
    const saved = await inventory.save();
    
    expect(saved._id).toBeDefined();
    expect(saved.items).toHaveLength(1);
  });
  
  // ✅ CASO 2: Agregar item nuevo
  test('Debe agregar un item nuevo', async () => {
    const inventory = new Inventory({
      userId: new mongoose.Types.ObjectId(),
      items: []
    });
    
    await inventory.save();
    await inventory.addItem('blade', 'DranDagger', 2);
    
    expect(inventory.items).toHaveLength(1);
    expect(inventory.items[0].quantity).toBe(2);
  });
  
  // ✅ CASO 3: Incrementar cantidad existente
  test('Debe incrementar cantidad de item existente', async () => {
    const inventory = new Inventory({
      userId: new mongoose.Types.ObjectId(),
      items: [{ type: 'blade', name: 'DranSword', quantity: 1 }]
    });
    
    await inventory.save();
    await inventory.addItem('blade', 'DranSword', 3);
    
    expect(inventory.items[0].quantity).toBe(4);
  });
  
  // ✅ CASO 4: Remover item
  test('Debe remover cantidad de un item', async () => {
    const inventory = new Inventory({
      userId: new mongoose.Types.ObjectId(),
      items: [{ type: 'blade', name: 'DranSword', quantity: 5 }]
    });
    
    await inventory.save();
    await inventory.removeItem('blade', 'DranSword', 2);
    
    expect(inventory.items[0].quantity).toBe(3);
  });
  
  // ❌ CASO 5: ERROR - Remover item inexistente
  test('ERROR: Debe lanzar error al remover item que no existe', async () => {
    const inventory = new Inventory({
        userId: new mongoose.Types.ObjectId(),
        items: []
    });
    
    await inventory.save();
    
    // Verificar que el método lanza un error
    await expect(async () => {
        await inventory.removeItem('blade', 'DranSword', 1);
    }).rejects.toThrow('Item no encontrado en el inventario');
});
  
  // ✅ CASO 6: Eliminar cuando llega a 0
  test('Debe eliminar item cuando cantidad llega a 0', async () => {
    const inventory = new Inventory({
      userId: new mongoose.Types.ObjectId(),
      items: [{ type: 'blade', name: 'DranSword', quantity: 2 }]
    });
    
    await inventory.save();
    await inventory.removeItem('blade', 'DranSword', 2);
    
    expect(inventory.items).toHaveLength(0);
  });
  
  // ✅ CASO 7: Verificar disponibilidad TRUE
  test('Debe retornar true cuando item está disponible', async () => {
    const inventory = new Inventory({
      userId: new mongoose.Types.ObjectId(),
      items: [{ type: 'blade', name: 'DranSword', quantity: 3 }]
    });
    
    await inventory.save();
    
    const hasItem = inventory.hasItem('blade', 'DranSword', 2);
    expect(hasItem).toBe(true);
  });
  
  // ❌ CASO 8: ERROR - Verificar disponibilidad FALSE
  test('Debe retornar false cuando item no está disponible', async () => {
    const inventory = new Inventory({
      userId: new mongoose.Types.ObjectId(),
      items: [{ type: 'blade', name: 'DranSword', quantity: 1 }]
    });
    
    await inventory.save();
    
    const hasItem = inventory.hasItem('blade', 'DranSword', 5);
    expect(hasItem).toBe(false);
  });
  
  // ❌ CASO 9: ERROR - Cantidad negativa
  test('No debe permitir cantidad negativa', async () => {
    const inventory = new Inventory({
      userId: new mongoose.Types.ObjectId(),
      items: [{ type: 'blade', name: 'DranSword', quantity: -1 }]
    });
    
    await expect(inventory.save()).rejects.toThrow();
  });
  
  // ✅ CASO 10: Múltiples tipos
  test('Debe manejar múltiples tipos de items', async () => {
    const inventory = new Inventory({
      userId: new mongoose.Types.ObjectId(),
      items: []
    });
    
    await inventory.save();
    await inventory.addItem('blade', 'DranSword', 1);
    await inventory.addItem('ratchet', '3-60', 2);
    await inventory.addItem('bit', 'Flat', 3);
    
    expect(inventory.items).toHaveLength(3);
  });
});