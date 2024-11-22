import { createClient } from 'redis';

class RedisClient {
  constructor() {
    this.client = createClient();

    this.connected = true; // Assume the connection is successful for the first `isAlive` call

    this.client.on('error', (err) => {
      console.error(`Redis client error: ${err}`);
      this.connected = false; // Update to false if an error occurs
    });

    this.client.on('ready', () => {
      console.log('Redis client connected successfully');
      this.connected = true; // Update the connection state accurately
    });
  }

  isAlive() {
    return this.connected; // Return the current connection state
  }

  async get(key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, (err, reply) => {
        if (err) {
          console.error(`Error fetching key "${key}": ${err}`);
          reject(err);
        } else {
          resolve(reply);
        }
      });
    });
  }

  async set(key, value, duration) {
    return new Promise((resolve, reject) => {
      this.client.set(key, value, 'EX', duration, (err, reply) => {
        if (err) {
          console.error(`Error setting key "${key}": ${err}`);
          reject(err);
        } else {
          resolve(reply);
        }
      });
    });
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
