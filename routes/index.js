/* eslint-disable jest/require-hook */
import express from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';

const router = express.Router();

// Define the endpoints
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

// new route for creating a user
router.post('/users', UsersController.postNew);
router.post('/files', FilesController.postUpload);

// New authentication routes
router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);
// New route for getting the user profile
router.get('/users/me', UsersController.getMe);
// New routes for files
router.post('/files', FilesController.postUpload);
router.get('/files/:id', FilesController.getShow);
router.get('/files', FilesController.getIndex);
router.put('/files/:id/publish', FilesController.putPublish);
router.put('/files/:id/unpublish', FilesController.putUnpublish);
router.get('/files/:id/data', FilesController.getFile);

export default router;
