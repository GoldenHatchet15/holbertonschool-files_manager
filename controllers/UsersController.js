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
      console.log('Fetching user token...');
      const token = req.headers['x-token'];
      if (!token) {
        console.log('Missing token in request');
        return res.status(401).json({ error: 'Unauthorized' });
      }
  
      const key = `auth_${token}`;
      console.log(`Fetching user ID from Redis with key: ${key}`);
      const userId = await redisClient.get(key);
  
      if (!userId) {
        console.log('Token not found in Redis or expired');
        return res.status(401).json({ error: 'Unauthorized' });
      }
  
      console.log(`User ID retrieved from Redis: ${userId}`);
      console.log('Querying MongoDB for user...');
  
      try {
        const objectId = new ObjectId(userId);
        console.log(`Converted userId to ObjectId: ${objectId}`);
        const user = await dbClient.db.collection('users').findOne({ _id: objectId });
  
        if (!user) {
          console.log('User not found in MongoDB');
          return res.status(404).json({ error: 'User not found' });
        }
  
        console.log('User retrieved successfully:', user);
        return res.status(200).json({ id: user._id, email: user.email });
      } catch (mongoError) {
        console.error('Error querying MongoDB:', mongoError);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    } catch (err) {
      console.error('Error in /users/me:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
  
}

export default UsersController;
