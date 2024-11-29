/* eslint-disable jest/require-hook */
import express from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';

const router = express.Router();

// Define the endpoints
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

// new route for creating a user
router.post('/users', UsersController.postNew);

export default router;
