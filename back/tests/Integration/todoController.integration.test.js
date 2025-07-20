const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const todoController = require('../../src/controllers/todoController');
const Todo = require('../../src/models/Todo');

describe('TodoController - Tests d\'intégration avec base de données', () => {
  let mongoServer;
  let app;

  // Configuration de l'application Express pour les tests
  beforeAll(async () => {
    // Créer une instance MongoDB en mémoire
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Connecter à la base de données de test
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Configuration de l'application Express
    app = express();
    app.use(express.json());
    
    // Routes pour les tests
    app.get('/api/todos', todoController.getAllTodos);
    app.post('/api/todos', todoController.createTodo);
    app.put('/api/todos/:id', todoController.updateTodo);
    app.delete('/api/todos/:id', todoController.deleteTodo);
  });

  // Nettoyage après tous les tests
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  // Nettoyage avant chaque test pour l'isolation
  beforeEach(async () => {
    await Todo.deleteMany({});
  });

  describe('GET /api/todos - getAllTodos', () => {
    test('devrait retourner une liste vide quand aucun todo n\'existe', async () => {
      const response = await request(app)
        .get('/api/todos')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    test('devrait retourner tous les todos triés par date de création décroissante', async () => {
      // Créer des todos de test directement en base
      const todo1 = await Todo.create({ text: 'Premier todo' });
      await new Promise(resolve => setTimeout(resolve, 10)); // Petite pause pour différencier les dates
      const todo2 = await Todo.create({ text: 'Second todo' });

      const response = await request(app)
        .get('/api/todos')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].text).toBe('Second todo'); // Plus récent en premier
      expect(response.body[1].text).toBe('Premier todo');
    });
  });

  describe('POST /api/todos - createTodo', () => {
    test('devrait créer un nouveau todo et le persister en base', async () => {
      const todoData = { text: 'Nouveau todo de test' };

      const response = await request(app)
        .post('/api/todos')
        .send(todoData)
        .expect(201);

      // Vérifier la réponse
      expect(response.body.text).toBe(todoData.text);
      expect(response.body.completed).toBe(false);
      expect(response.body._id).toBeDefined();
      expect(response.body.createdAt).toBeDefined();

      // Vérifier la persistance en base
      const savedTodo = await Todo.findById(response.body._id);
      expect(savedTodo).toBeTruthy();
      expect(savedTodo.text).toBe(todoData.text);
      expect(savedTodo.completed).toBe(false);
    });

    test('devrait retourner une erreur 400 si le texte est manquant', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({})
        .expect(400);

      expect(response.body.message).toBeDefined();
      
      // Vérifier qu'aucun todo n'a été créé
      const count = await Todo.countDocuments();
      expect(count).toBe(0);
    });
  });

  describe('PUT /api/todos/:id - updateTodo', () => {
    test('devrait mettre à jour un todo existant et persister les changements', async () => {
      // Créer un todo de test
      const todo = await Todo.create({ text: 'Todo à modifier' });

      const response = await request(app)
        .put(`/api/todos/${todo._id}`)
        .send({ completed: true })
        .expect(200);

      // Vérifier la réponse
      expect(response.body.completed).toBe(true);
      expect(response.body.text).toBe('Todo à modifier');

      // Vérifier la persistance en base
      const updatedTodo = await Todo.findById(todo._id);
      expect(updatedTodo.completed).toBe(true);
      expect(updatedTodo.text).toBe('Todo à modifier');
    });

    test('devrait retourner 404 si le todo n\'existe pas', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .put(`/api/todos/${fakeId}`)
        .send({ completed: true })
        .expect(404);

      expect(response.body.message).toBe('Todo not found');
    });

    test('devrait retourner 400 si l\'ID est invalide', async () => {
      const response = await request(app)
        .put('/api/todos/invalid-id')
        .send({ completed: true })
        .expect(400);

      expect(response.body.message).toBeDefined();
    });
  });
});