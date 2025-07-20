const request = require('supertest');
const { app, closeServer } = require('../../src/app');

// Mock des dépendances externes
jest.mock('../../src/config/db', () => jest.fn());
jest.mock('../../src/routes/todoRoutes', () => {
  const express = require('express');
  const router = express.Router();
  
  // Route mock pour les tests
  router.get('/', (req, res) => {
    res.json({ message: 'les routes fonctionnent' });
  });

  // Mock POST route for /api/todos
  router.post('/', (req, res) => {
    res.status(201).json({ title: req.body.title });
  });
  
  return router;
});

describe('Express Server', () => {
  afterEach(async () => {
    await closeServer();
  });

  test('app devrait être défini et être une application Express', () => {
    expect(app).toBeDefined();
    expect(typeof app).toBe('function');
    expect(app.listen).toBeDefined();
  });

  test('le serveur devrait gérer les requêtes JSON', async () => {
    const response = await request(app)
      .post('/api/todos')
      .send({ title: 'Test todo' })
      .expect('Content-Type', /json/);
    
    // Le serveur devrait accepter et traiter le JSON
    expect(response.status).toBeDefined();
  });

  test('le serveur devrait gérer les requêtes CORS', async () => {
    const response = await request(app)
      .get('/api/todos')
      .expect(200);
    
    // Vérifier que CORS est activé
    expect(response.headers['access-control-allow-origin']).toBeDefined();
  });

  test('les routes todos devraient être accessibles', async () => {
    const response = await request(app)
      .get('/api/todos')
      .expect(200);

    expect(response.body).toEqual({ message: 'les routes fonctionnent' });
  });

  test('le serveur devrait démarrer et se fermer correctement', async () => {
    // Test que le serveur peut démarrer
    const serverInstance = await new Promise((resolve) => {
      const server = app.listen(0, () => {
        resolve(server);
      });
    });
    
    expect(serverInstance).toBeDefined();
    expect(serverInstance.listening).toBe(true);
    
    // Test que le serveur peut se fermer
    await new Promise((resolve) => {
      serverInstance.close(resolve);
    });
    
    expect(serverInstance.listening).toBe(false);
  });


  test('devrait mocker Date.now', () => {
  // Mock ultra simple de Date.now
  const mockDate = jest.spyOn(Date, 'now').mockReturnValue(1234567890);
  
  const timestamp = Date.now();
  
  expect(timestamp).toBe(1234567890);
  expect(mockDate).toHaveBeenCalled();
  
  // Nettoyer le mock
  mockDate.mockRestore();
});

});