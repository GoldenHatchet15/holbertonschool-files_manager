import { MongoClient, ObjectId } from 'mongodb';
import crypto from 'crypto';
import dbClient from '../utils/db';

class UsersController {
  /**
   * POST /users endpoint to create a new user
   */
  static async postNew(req, res) {
    const { email, password } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    // Validate password
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    const usersCollection = dbClient.db.collection('users');

    try {
      // Check if email already exists in the database
      const existingUser = await usersCollection.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Already exist' });
      }

      // Hash the password using SHA1
      const sha1Password = crypto.createHash('sha1').update(password).digest('hex');

      // Insert new user into the database
      const newUser = {
        email,
        password: sha1Password,
      };

      const result = await usersCollection.insertOne(newUser);

      // Respond with the new user's id and email
      return res.status(201).json({ id: result.insertedId, email });
    } catch (error) {
      console.error('Error creating new user:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default UsersController;
