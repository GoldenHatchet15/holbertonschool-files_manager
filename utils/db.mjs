import mongodb from 'mongodb'; // Import mongodb
const { MongoClient } = mongodb; // Destructure MongoClient from mongodb

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

    this.connected = false; // Tracks connection status
    this.connectionPromise = this.connectToDatabase(); // Store the promise for connection handling
  }

  async connectToDatabase() {
    try {
      await this.client.connect();
      this.connected = true;
      console.log('MongoDB client connected successfully');
    } catch (error) {
      console.error(`MongoDB connection error: ${error.message}`);
      this.connected = false; // Ensure the connected flag is false on failure
    }
  }

  isAlive() {
    // Check if the connection has been established
    return this.connected && this.client.topology && this.client.topology.isConnected();
  }

  async nbUsers() {
    // Ensure database is connected before querying
    await this.connectionPromise; // Wait for the connection to resolve or fail
    if (!this.isAlive()) return 0;

    try {
      const db = this.client.db(this.databaseName);
      const count = await db.collection('users').countDocuments();
      return count;
    } catch (error) {
      console.error(`Error fetching user count: ${error.message}`);
      return 0;
    }
  }

  async nbFiles() {
    // Ensure database is connected before querying
    await this.connectionPromise; // Wait for the connection to resolve or fail
    if (!this.isAlive()) return 0;

    try {
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

// Export singleton instance of DBClient
const dbClient = new DBClient();
export default dbClient;
