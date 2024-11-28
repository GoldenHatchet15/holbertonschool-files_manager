/* eslint jest/require-hook: "off" */
import { Router } from 'express';
import AppController from '../controllers/AppController';

const router = Router();

// Define API routes
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

export default (app) => {
  app.use('/', router);
};
