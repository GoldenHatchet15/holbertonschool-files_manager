import { beforeAll, describe } from '@jest/globals';
import express from 'express';
import router from './routes/index';

const app = express();
const port = process.env.PORT || 5000;

// Load all routes
router(app);

// Start the server
describe('server setup', () => {
  beforeAll(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  });
});
