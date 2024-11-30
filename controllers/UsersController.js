import { ObjectId } from 'mongodb';
import sha1 from 'sha1';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';


class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    const existingUser = await dbClient.db.collection('users').findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: 'Already exist' });
    }

    const hashedPassword = sha1(password);
    const result = await dbClient.db.collection('users').insertOne({
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      id: result.insertedId.toString(),
      email,
    });
  }

  static async getMe(req, res) {
    try {
      const token = req.headers['x-token'];

      if (!token) {
        console.log('Token is missing');
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const key = `auth_${token}`;
      console.log(`Fetching user ID from Redis with key: ${key}`);
      const userId = await redisClient.get(key);

      if (!userId) {
        console.log('No user found for the provided token');
        return res.status(401).json({ error: 'Unauthorized' });
      }

      console.log(`Fetching user from MongoDB with ID: ${userId}`);
      const user = await dbClient.db.collection('users').findOne({ _id: new dbClient.ObjectId(userId) });

      if (!user) {
        console.log('No user found in MongoDB');
        return res.status(401).json({ error: 'Unauthorized' });
      }

      console.log(`User found: ${JSON.stringify(user)}`);
      return res.status(200).json({ id: user._id.toString(), email: user.email });
    } catch (err) {
      console.error('Error in getMe:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default UsersController;
