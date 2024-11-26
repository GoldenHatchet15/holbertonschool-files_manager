import pkg from 'mongodb';
const { MongoClient } = pkg;

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
    this.connecting = true;
    console.log('Attempting to connect to MongoDB...');
    try {
      await this.client.connect();
      console.log('MongoDB client connected successfully');
      this.connected = this.client.topology.isConnected();
    } catch (err) {
      console.error(`MongoDB connection error: ${err.message}`);
      this.connected = false;
    } finally {
      console.log(`Connected: ${this.connected}`);
      this.connecting = false;
    }
  }
  

isAlive() {
  return this.client && this.client.topology && this.client.topology.isConnected();
}


async nbUsers() {
  if (!this.connected) {
      console.error('Database not connected.');
      return 0;
  }
  try {
      const db = this.client.db(this.databaseName);
      const count = await db.collection('users').countDocuments();
      return count;
  } catch (err) {
      console.error(`Error fetching user count: ${err.message}`);
      return 0; // Ensure returning 0 on error
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
      return 0;  // Ensure returning 0 on error
    }
  }
}

let dbClient = new DBClient();

export default dbClient;