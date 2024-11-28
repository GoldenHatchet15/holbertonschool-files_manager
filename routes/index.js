import { Router } from 'express';
import AppController from '../controllers/AppController.js';

const router = Router();

// Define API routes
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

// Export the router
export default router;
