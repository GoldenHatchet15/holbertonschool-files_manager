import { ObjectId } from 'mongodb';
import sha1 from 'sha1';
import dbClient from '../utils/db';

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    // Check for missing email
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    // Check for missing password
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    try {
      // Check if the email already exists in the database
      const existingUser = await dbClient.db.collection('users').findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Already exist' });
      }

      // Hash the password
      const hashedPassword = sha1(password);

      // Insert the new user into the database
      const result = await dbClient.db.collection('users').insertOne({
        email,
        password: hashedPassword,
      });

      // Return the new user's id and email
      return res.status(201).json({
        id: result.insertedId.toString(),
        email,
      });
    } catch (error) {
      console.error('Error creating user:', error.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default UsersController;
