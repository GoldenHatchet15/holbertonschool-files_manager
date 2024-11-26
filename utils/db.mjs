const { MongoClient } = require('mongodb');

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 27017;
const DB_DATABASE = process.env.DB_DATABASE || 'files_manager';
const url = `mongodb://${DB_HOST}:${DB_PORT}`;

class DBClient {
  constructor() {
    MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
      if (err) {
        console.error(`MongoDB connection error: ${err.message}`);
        this.db = null;
      } else {
        console.log('MongoDB client connected successfully');
        this.db = client.db(DB_DATABASE);
      }
    });
  }

  isAlive() {
    return !!this.db;
  }

  async nbUsers() {
    if (!this.db) {
      return 0;
    }
    try {
      return await this.db.collection('users').countDocuments();
    } catch (err) {
      console.error(`Error counting users: ${err.message}`);
      return 0;
    }
  }

  async nbFiles() {
    if (!this.db) {
      return 0;
    }
    try {
      return await this.db.collection('files').countDocuments();
    } catch (err) {
      console.error(`Error counting files: ${err.message}`);
      return 0;
    }
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
