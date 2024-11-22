import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';

    // Construct the MongoDB URI including the database name
    const uri = `mongodb://${host}:${port}/${database}`;
    this.databaseName = database;

    this.connected = false; // Initial state to track connection status

    this.client = new MongoClient(uri, {
      useUnifiedTopology: true,
    });

    // Connect to the database upon instance creation
    this.connectToDatabase();
  }

  async connectToDatabase() {
    try {
      await this.client.connect();
      console.log('MongoDB client connected successfully');
      this.connected = true;
    } catch (err) {
      console.error(`MongoDB connection error: ${err.message}`);
      this.connected = false;

      // Retry connection after 1 second, handling errors in retry logic
      setTimeout(() => {
        this.connectToDatabase().catch(err => console.error('Retry connection failed:', err))
      }, 1000);
    }
  }

  isAlive() {
    // Return the actual connection status
    return this.connected;
  }

  async nbUsers() {
    if (!this.connected) {
      console.error('Database not connected.');
      return 0; // Return 0 if not connected to prevent errors
    }
    try {
      const db = this.client.db(this.databaseName);
      return await db.collection('users').countDocuments();
    } catch (err) {
      console.error(`Error fetching user count: ${err.message}`);
      return 0;
    }
  }

  async nbFiles() {
    if (!this.connected) {
      console.error('Database not connected.');
      return 0; // Return 0 if not connected to prevent errors
    }
    try {
      const db = this.client.db(this.databaseName);
      return await db.collection('files').countDocuments();
    } catch (err) {
      console.error(`Error fetching file count: ${err.message}`);
      return 0;
    }
  }
}

// Create and export an instance of DBClient
const dbClient = new DBClient();

export default dbClient;
