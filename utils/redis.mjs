import redis from 'redis';

class RedisClient {
  constructor() {
    this.client = redis.createClient(); // For Redis 2.x

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    this.client.on('ready', () => {
      console.log('Redis Client connected and ready');
    });
  }

  isAlive() {
    return this.client.connected; // Redis 2.x uses `connected` property
  }

  get(key) {
    console.log(`Attempting to get key: ${key}`);
    return new Promise((resolve, reject) => {
      this.client.get(key, (err, reply) => {
        if (err) {
          console.error(`Error getting key "${key}":`, err);
          reject(err);
        } else {
          console.log(`Key "${key}" retrieved successfully: ${reply}`);
          resolve(reply);
        }
      });
    });
  }

  set(key, value, duration) {
    console.log(`Attempting to set key: ${key} with value: ${value} and duration: ${duration}s`);
    return new Promise((resolve, reject) => {
      this.client.set(key, value, 'EX', duration, (err, reply) => {
        if (err) {
          console.error(`Error setting key "${key}":`, err);
          reject(err);
        } else {
          console.log(`Key "${key}" set successfully: ${reply}`);
          resolve(reply);
        }
      });
    });
  }

  del(key) {
    console.log(`Attempting to delete key: ${key}`);
    return new Promise((resolve, reject) => {
      this.client.del(key, (err, reply) => {
        if (err) {
          console.error(`Error deleting key "${key}":`, err);
          reject(err);
        } else {
          console.log(`Key "${key}" deleted successfully: ${reply}`);
          resolve(reply);
        }
      });
    });
  }
}

const redisClient = new RedisClient();
export default redisClient;
