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

  //isAlive() {
  //  return this.client.isReady;
  //}

  async isAlive() {
    try {
      const result = await this.client.ping();
      console.log(`Redis PING result: ${result}`);
      return result === 'PONG';
    } catch (err) {
      console.error('Redis PING failed:', err);
      return false;
    }
  }
  
  async get(key) {
    console.log(`Attempting to get key: ${key} from Redis`);
    const startTime = Date.now();
  
    return new Promise((resolve, reject) => {
      // Set a timeout to handle cases where the operation gets stuck
      const timeout = setTimeout(() => {
        const duration = Date.now() - startTime;
        console.error(`Redis GET operation timed out for key: ${key} (took ${duration}ms)`);
        reject(new Error(`Redis GET operation timed out for key: ${key}`));
      }, 5000); // 5-second timeout
  
      this.client.get(key, (err, reply) => {
        clearTimeout(timeout); // Clear timeout on success or error
        const duration = Date.now() - startTime;
  
        if (err) {
          console.error(`Error getting key "${key}" from Redis (took ${duration}ms): ${err}`);
          return reject(err);
        }
  
        console.log(`Successfully retrieved key "${key}" from Redis: ${reply} (took ${duration}ms)`);
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
