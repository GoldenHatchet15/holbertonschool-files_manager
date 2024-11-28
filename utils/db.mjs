import mongodb from 'mongodb';
const { MongoClient } = mongodb;

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    const uri = `mongodb://${host}:${port}/${database}`;

    this.databaseName = database;
    this.client = new MongoClient(uri, { useUnifiedTopology: true });
    this.connected = false;

    // Begin connection process
    this.initConnection();
  }

  isAlive() {
    console.log('MongoDB Topology:', this.client.topology?.isConnected());
    return this.client.topology && this.client.topology.isConnected();
  }
  
  async initConnection() {
    try {
      console.log('Attempting to connect to MongoDB...');
      await this.client.connect();
      console.log('MongoDB client connected successfully');
      this.connected = true;
    } catch (error) {
      console.error(`MongoDB connection error: ${error.message}`);
      this.connected = false;
    }
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

const dbClient = new DBClient();
export default dbClient;
