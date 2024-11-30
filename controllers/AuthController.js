import { v4 as uuidv4 } from 'uuid';
import sha1 from 'sha1';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AuthController {
  static async getConnect(req, res) {
    try {
      console.log('Received request to /connect');
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Basic ')) {
        console.log('Missing or invalid Authorization header');
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Decode the Base64 authorization header
      const base64Credentials = authHeader.split(' ')[1];
      const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
      const [email, password] = credentials.split(':');

      if (!email || !password) {
        console.log('Email or password is missing');
        return res.status(401).json({ error: 'Unauthorized' });
      }

      console.log(`Authenticating user: ${email}`);
      const hashedPassword = sha1(password);
      const user = await dbClient.db.collection('users').findOne({ email, password: hashedPassword });

      if (!user) {
        console.log('User not found or invalid credentials');
        return res.status(401).json({ error: 'Unauthorized' });
      }

      console.log('User authenticated successfully');
      const token = uuidv4();
      const key = `auth_${token}`;

      // Simplified Redis test
      console.log(`Saving token to Redis with key: ${key}`);
      await redisClient.set(key, user._id.toString(), 86400); // Save for 24 hours
      console.log('Token saved successfully');

      // Respond with the token
      return res.status(200).json({ token });
    } catch (err) {
      console.error('Error in /connect:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];

    if (!token) {
      console.log('Token is missing');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const key = `auth_${token}`;
    const userId = await redisClient.get(key);

    if (!userId) {
      console.log('No user found for the provided token');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log(`Deleting token from Redis: ${key}`);
    await redisClient.del(key);
    return res.status(204).send();
  }
}

export default AuthController;
