import mongodb from 'mongodb'; // Import the entire mongodb module
const { MongoClient } = mongodb; // Destructure MongoClient from the module

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
    this.connectToDatabase(); // Start connecting to the database
  }

  async connectToDatabase() {
    try {
      await this.client.connect();
      this.connected = true;
      console.log('MongoDB client connected successfully');
    } catch (error) {
      console.error(`MongoDB connection error: ${error.message}`);
      this.connected = false; // Ensure connection status is updated
    }
  }

  isAlive() {
    // Returns false if not connected
    return this.connected && this.client.topology && this.client.topology.isConnected();
  }

  async nbUsers() {
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

// Export the singleton instance
const dbClient = new DBClient();
export default dbClient;
