const Todo = require('../models/Todo');
const controller = require('../controllers/TodoController');

// On remplace toutes les fonctions de Todo par des "faux" avec Jest
jest.mock('../models/Todo');

describe('TodoController', () => {
  let req, res;

  // Avant chaque test, on prépare des objets vides simulés
  beforeEach(() => {
    req = { body: {}, params: {} };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
  });
  // Test pour la création d'un Todo
  it('should create a new Todo', async () => {
    req.body = { title: 'Test Todo', completed: false };
    Todo.create.mockResolvedValue(req.body);

    await controller.create(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(req.body);
  });
  
});