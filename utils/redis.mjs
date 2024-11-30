import { createClient } from 'redis';

class RedisClient {
  constructor() {
    this.client = createClient();

    this.client.on('error', (err) => {
      console.error(`Redis client error: ${err}`);
    });

    this.client.on('ready', () => {
      console.log('Redis client connected successfully');
    });

    // Connect the client explicitly
    this.client.connect().catch((err) => {
      console.error(`Redis client connection error: ${err}`);
    });
  }

  isAlive() {
    return this.client.isReady;
  }

  async get(key) {
    console.log(`Attempting to get key: ${key} from Redis`);
    return new Promise((resolve, reject) => {
      this.client.get(key, (err, reply) => {
        if (err) {
          console.error(`Error getting key "${key}" from Redis: ${err}`);
          return reject(err);
        }
        console.log(`Successfully retrieved key "${key}" from Redis: ${reply}`);
        resolve(reply);
      });
    });
  }
  

  async set(key, value, duration) {
    console.log(`Attempting to set key: ${key} with value: ${value} and duration: ${duration}s`);
    try {
      await this.client.set(key, value, 'EX', duration); // Ensure this line executes properly
      console.log(`Key set successfully: ${key}`);
    } catch (err) {
      console.error(`Error setting key in Redis: ${err}`);
      throw err; // Re-throw the error to be handled in the caller
    }
  }

  async del(key) {
    return new Promise((resolve, reject) => {
      this.client.del(key, (err, reply) => {
        if (err) {
          console.error(`Error deleting key "${key}": ${err}`);
          reject(err);
        } else {
          resolve(reply);
        }
      });
    });
  }
}

const redisClient = new RedisClient();

export default redisClient;
