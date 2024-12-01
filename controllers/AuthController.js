import { v4 as uuidv4 } from 'uuid';
import sha1 from 'sha1';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AuthController {
  static async getConnect(req, res) {
    try {
      const authHeader = req.headers.authorization || '';
      const encoded = authHeader.split(' ')[1];
      const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
      const [email, password] = decoded.split(':');

      if (!email || !password) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const hashedPassword = sha1(password);
      const user = await dbClient.db.collection('users').findOne({ email, password: hashedPassword });

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const token = uuidv4();
      const key = `auth_${token}`;
      await redisClient.set(key, user._id.toString(), 86400);

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
