import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    const uri = `mongodb://${host}:${port}/${database}`;

    this.client = new MongoClient(uri, {
      useUnifiedTopology: true,
    });

    this.databaseName = database;
    this.connected = false; // Track the connection status

    this.connectToDatabase(); // Start connecting to the database
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
    // Check the connection status
    return this.connected && this.client.topology && this.client.topology.isConnected();
  }

  async nbUsers() {
    // Return 0 if the database is not connected
    if (!this.isAlive()) return 0;

    try {
      const db = this.client.db(this.databaseName);
      return await db.collection('users').countDocuments();
    } catch (error) {
      console.error(`Error fetching user count: ${error.message}`);
      return 0;
    }
  }

  async nbFiles() {
    // Return 0 if the database is not connected
    if (!this.isAlive()) return 0;

    try {
      const db = this.client.db(this.databaseName);
      return await db.collection('files').countDocuments();
    } catch (error) {
      console.error(`Error fetching file count: ${error.message}`);
      return 0;
    }
  }
}

// Export an instance of DBClient
const dbClient = new DBClient();
export default dbClient;
