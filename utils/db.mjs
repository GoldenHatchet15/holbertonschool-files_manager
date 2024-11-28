import mongodb from 'mongodb';
const { MongoClient } = mongodb;

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || '127.0.0.1';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    const uri = `mongodb://${host}:${port}/${database}`;

    this.databaseName = database;
    this.client = new MongoClient(uri, { useUnifiedTopology: true });
    this.connected = false;

    // Begin connection process
    this.initConnection();
  }

  async initConnection() {
    try {
      console.log(`Attempting to connect to MongoDB at ${this.client.s.url}...`);
      await this.client.connect();
      this.connected = true;
      console.log('MongoDB client connected successfully');
    } catch (error) {
      console.error(`MongoDB connection error: ${error.message}`);
    }
  }

  isAlive() {
    return this.connected; // Simplified check using connection state
  }

  get db() {
    return this.client.db(this.databaseName);
  }

  async nbUsers() {
    if (!this.isAlive()) return 0;

    try {
      return await this.db.collection('users').countDocuments();
    } catch (error) {
      console.error(`Error fetching user count: ${error.message}`);
      return 0;
    }
  }

  async nbFiles() {
    if (!this.isAlive()) return 0;

    try {
      return await this.db.collection('files').countDocuments();
    } catch (error) {
      console.error(`Error fetching file count: ${error.message}`);
      return 0;
    }
  }
}

const dbClient = new DBClient();
export default dbClient;
