import { Router } from 'express';
import AppController from '../controllers/AppController';

const router = Router();

// Define the /status route
router.get('/status', AppController.getStatus);

// Export the router directly
export default router;
