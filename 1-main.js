import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    const uri = `mongodb://${host}:${port}/${database}`;

    this.databaseName = database;

    this.client = new MongoClient(uri, {
      useUnifiedTopology: true,
    });

    this.connected = false; // Tracks the connection status
    this.connecting = this.connectToDatabase(); // Start connecting to the database
  }

  async connectToDatabase() {
    try {
      await this.client.connect();
      this.connected = true;
      console.log('MongoDB client connected successfully');
    } catch (error) {
      console.error(`MongoDB connection error: ${error.message}`);
    }
  }

  isAlive() {
    // Returns true if the connection is established
    return this.connected && this.client.topology && this.client.topology.isConnected();
  }

  async nbUsers() {
    try {
      if (!this.isAlive()) return 0;
      const db = this.client.db(this.databaseName);
      const count = await db.collection('users').countDocuments();
      return count;
    } catch (error) {
      console.error(`Error fetching user count: ${error.message}`);
      return 0;
    }
  }

  async nbFiles() {
    try {
      if (!this.isAlive()) return 0;
      const db = this.client.db(this.databaseName);
      const count = await db.collection('files').countDocuments();
      return count;
    } catch (error) {
      console.error(`Error fetching file count: ${error.message}`);
      return 0;
    }
  }
}

// Global error handling for unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Promise Rejection:', reason);
});

// Export a singleton instance of DBClient
const dbClient = new DBClient();
export default dbClient;
