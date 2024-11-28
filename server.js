import express from 'express';
import router from './routes/index';

const app = express();
const port = process.env.PORT || 5000;

// Load all routes
router(app);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
