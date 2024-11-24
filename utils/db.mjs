import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    const uri = `mongodb://${host}:${port}/${database}`;

    this.databaseName = database;
    this.connected = false;
    this.connecting = false;  // Flag to manage connection attempts

    this.client = new MongoClient(uri, {
      useUnifiedTopology: true,
    });

    this.connectToDatabase();
  }

  async connectToDatabase() {
    if (this.connecting || this.connected) return;
    this.connecting = true;

    try {
      await this.client.connect();
      console.log('MongoDB client connected successfully');
      this.connected = true;
    } catch (err) {
      console.error(`MongoDB connection error: ${err.message}`);
      this.connected = false;
      setTimeout(() => this.connectToDatabase(), 1000);
    } finally {
      this.connecting = false;
    }
  }

  isAlive() {
    return this.connected;
  }

  async nbUsers() {
    if (!this.connected) {
      console.error('Database not connected.');
      return 0;
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
      return 0;
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

const dbClient = new DBClient();

export default dbClient;
