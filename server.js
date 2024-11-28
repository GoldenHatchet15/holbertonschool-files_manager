/* eslint jest/require-hook: "off" */
import express from 'express';
import router from './routes/index';

const app = express();
const port = process.env.PORT || 5000;

// Load all routes
router(app);

// Start the server only when not in testing mode
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app; // Export the app for testing
