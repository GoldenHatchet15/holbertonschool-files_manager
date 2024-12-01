import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';
import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class FilesController {
  static async postUpload(req, res) {
    try {
      // Authenticate user using token
      const token = req.headers['x-token'];
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Get input data
      const { name, type, parentId = 0, isPublic = false, data } = req.body;

      // Validate inputs
      if (!name) {
        return res.status(400).json({ error: 'Missing name' });
      }
      if (!type || !['folder', 'file', 'image'].includes(type)) {
        return res.status(400).json({ error: 'Missing type' });
      }
      if (type !== 'folder' && !data) {
        return res.status(400).json({ error: 'Missing data' });
      }

      // Validate parentId if provided
      let parentFile = null;
      if (parentId !== 0) {
        parentFile = await dbClient.db.collection('files').findOne({ _id: new ObjectId(parentId) });
        if (!parentFile) {
          return res.status(400).json({ error: 'Parent not found' });
        }
        if (parentFile.type !== 'folder') {
          return res.status(400).json({ error: 'Parent is not a folder' });
        }
      }

      // Prepare file data for database
      const fileDocument = {
        userId: new ObjectId(userId),
        name,
        type,
        isPublic,
        parentId: parentId === 0 ? '0' : new ObjectId(parentId),
      };

      // Handle folder creation
      if (type === 'folder') {
        const result = await dbClient.db.collection('files').insertOne(fileDocument);
        return res.status(201).json({
          id: result.insertedId.toString(),
          userId,
          name,
          type,
          isPublic,
          parentId,
        });
      }

      // Handle file/image creation
      const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      const localPath = path.join(folderPath, uuidv4());
      fs.writeFileSync(localPath, Buffer.from(data, 'base64'));

      fileDocument.localPath = localPath;

      const result = await dbClient.db.collection('files').insertOne(fileDocument);

      return res.status(201).json({
        id: result.insertedId.toString(),
        userId,
        name,
        type,
        isPublic,
        parentId,
      });
    } catch (err) {
      console.error('Error in /files:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default FilesController;