import { createClient } from 'redis';

class RedisClient {
  constructor() {
    this.client = createClient({
      socket: {
        connectTimeout: 5000, // 5 seconds for connection timeout
      },
    });

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    this.client.on('ready', () => {
      console.log('Redis Client connected and ready');
    });

    this.client.connect().catch((err) => {
      console.error('Redis Client failed to connect:', err);
    });
  }

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
    try {
      const value = await this.client.get(key);
      console.log(`Successfully retrieved key "${key}" from Redis: ${value}`);
      return value;
    } catch (err) {
      console.error(`Error fetching key "${key}" from Redis: ${err.message}`);
      throw err;
    }
  }

  async set(key, value, duration) {
    console.log(`Attempting to set key: ${key} with value: ${value} and duration: ${duration}s`);
    try {
      await this.client.set(key, value, {
        EX: duration, // Set expiration in seconds
      });
      console.log(`Key "${key}" set successfully`);
    } catch (err) {
      console.error(`Error setting key "${key}" in Redis: ${err.message}`);
      throw err;
    }
  }

  async del(key) {
    console.log(`Attempting to delete key: ${key} from Redis`);
    try {
      await this.client.del(key);
      console.log(`Key "${key}" deleted successfully`);
    } catch (err) {
      console.error(`Error deleting key "${key}" from Redis: ${err.message}`);
      throw err;
    }
  }
}

const redisClient = new RedisClient();
export default redisClient;
