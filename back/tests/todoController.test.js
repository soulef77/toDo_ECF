const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const Todo = require('../src/models/Todo');
const todoController = require('../src/controllers/todoController');

// Create a test app
const app = express();
app.use(express.json());

// Set up routes
app.get('/todos', todoController.getAllTodos);
app.post('/todos', todoController.createTodo);
app.put('/todos/:id', todoController.updateTodo);
app.delete('/todos/:id', todoController.deleteTodo);

// Database setup
beforeAll(async () => {
  const url = process.env.MONGODB_TEST_URL || 'mongodb://localhost:27017/todo-test';
  await mongoose.connect(url, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
  });
});

beforeEach(async () => {
  await Todo.deleteMany({});
});

afterAll(async () => {
  await Todo.deleteMany({});
  await mongoose.connection.close();
});

describe('Todo Controller', () => {
  
  describe('POST /todos', () => {
    it('devrait créer un nouveau todo avec des données valides', async () => {
      const todoData = { text: 'Test Todo' };
      
      const response = await request(app)
        .post('/todos')
        .send(todoData)
        .expect(201);

      expect(response.body.text).toBe(todoData.text);
      expect(response.body.completed).toBe(false);
      expect(response.body._id).toBeDefined();
      expect(response.body.createdAt).toBeDefined();
    });

    it('devrait renvoyer 400 lorsque le texte est manquant', async () => {
      const response = await request(app)
        .post('/todos')
        .send({})
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    it('devrait renvoyer 400 lorsque le texte est vide', async () => {
      const response = await request(app)
        .post('/todos')
        .send({ text: '' })
        .expect(400);

      expect(response.body.message).toBeDefined();
    });
  });

  describe('GET /todos', () => {
    it('devrait retourner un tableau vide lorsque aucun todo n\'existe', async () => {
      const response = await request(app)
        .get('/todos')
        .expect(200);

      expect(response.body).toEqual([]);
    });

   
    it('devrait renvoyer tous les todos avec tous les champs requis', async () => {
      await Todo.create({ text: 'Test Todo', completed: true });

      const response = await request(app)
        .get('/todos')
        .expect(200);

      const todo = response.body[0];
      expect(todo).toHaveProperty('_id');
      expect(todo).toHaveProperty('text');
      expect(todo).toHaveProperty('completed');
      expect(todo).toHaveProperty('createdAt');
    });
  });

  describe('PUT /todos/:id', () => {
    it('devrait mettre à jour le statut de complétion du todo', async () => {
      const todo = await Todo.create({ text: 'Test Todo', completed: false });

      const response = await request(app)
        .put(`/todos/${todo._id}`)
        .send({ completed: true })
        .expect(200);

      expect(response.body.completed).toBe(true);
      expect(response.body.text).toBe('Test Todo');
      
      // Verify in database
      const updatedTodo = await Todo.findById(todo._id);
      expect(updatedTodo.completed).toBe(true);
    });

    it('devrait renvoyer 404 lorsque le todo n\'existe pas', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .put(`/todos/${nonExistentId}`)
        .send({ completed: true })
        .expect(404);

      expect(response.body.message).toBe('Todo not found');
    });

    it('devrait renvoyer 400 avec un ObjectId invalide', async () => {
      const response = await request(app)
        .put('/todos/invalid-id')
        .send({ completed: true })
        .expect(400);

      expect(response.body.message).toBeDefined();
    });
  });

  

    it('devrait renvoyer 404 lorsque le todo n\'existe pas', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/todos/${nonExistentId}`)
        .expect(404);

      expect(response.body.message).toBe('Todo not found');
    });
  });

 

  describe('Error Handling', () => {
    it('devrait gérer les erreurs de connexion à la base de données avec grâce', async () => {
      // Temporarily close the connection
      await mongoose.connection.close();

      const response = await request(app)
        .get('/todos')
        .expect(500);

      expect(response.body.message).toBeDefined();

      // Reconnect for other tests
      const url = process.env.MONGODB_TEST_URL || 'mongodb://localhost:27017/todo-test';
      await mongoose.connect(url, { 
        useNewUrlParser: true, 
        useUnifiedTopology: true 
      });
    });
  });

module.exports = app;