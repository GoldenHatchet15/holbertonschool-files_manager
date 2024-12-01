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

  // Get a file document by id
  static async getShow(req, res) {
    try {
      const token = req.headers['x-token'];
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
  
      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
  
      const { id } = req.params;
  
      if (!ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'Not found' });
      }
  
      const file = await dbClient.db.collection('files').findOne({
        _id: new ObjectId(id),
        userId: new ObjectId(userId),
      });
  
      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }
  
      file.id = file._id.toString();
      delete file._id;
  
      return res.status(200).json(file);
    } catch (err) {
      console.error('Error in /files/:id:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // Get a list of file documents with pagination
  static async getIndex(req, res) {
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

      const parentId = req.query.parentId || '0';
      const page = parseInt(req.query.page, 10) || 0;
      const itemsPerPage = 20;

      const filter = {
        userId: new ObjectId(userId),
        parentId: parentId === '0' ? '0' : new ObjectId(parentId),
      };

      const files = await dbClient.db.collection('files')
        .aggregate([
          { $match: filter },
          { $skip: page * itemsPerPage },
          { $limit: itemsPerPage },
        ])
        .toArray();

      // Convert MongoDB ObjectIds to strings
      const filesWithIds = files.map(file => ({
        ...file,
        id: file._id.toString(),
        _id: undefined,
      }));

      return res.status(200).json(filesWithIds);
    } catch (err) {
      console.error('Error in /files:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async putPublish(req, res) {
    await FilesController.updateFilePublishState(req, res, true);
  }

  static async putUnpublish(req, res) {
    await FilesController.updateFilePublishState(req, res, false);
  }

  static async updateFilePublishState(req, res, isPublic) {
    try {
      const token = req.headers['x-token'];
      if (!token) return res.status(401).json({ error: 'Unauthorized' });

      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const { id } = req.params;
      const fileId = new ObjectId(id);

      const file = await dbClient.db.collection('files').findOne({ _id: fileId, userId: new ObjectId(userId) });
      if (!file) return res.status(404).json({ error: 'Not found' });

      await dbClient.db.collection('files').updateOne(
        { _id: fileId },
        { $set: { isPublic } }
      );

      const updatedFile = await dbClient.db.collection('files').findOne({ _id: fileId });

      return res.status(200).json({
        id: updatedFile._id,
        userId: updatedFile.userId,
        name: updatedFile.name,
        type: updatedFile.type,
        isPublic: updatedFile.isPublic,
        parentId: updatedFile.parentId || 0,
      });
    } catch (err) {
      console.error('Error in updating file publish state:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getFile(req, res) {
    try {
      console.log('Fetching file data...');
      const { id } = req.params;
      const token = req.headers['x-token'];

      // Validate ObjectId
      if (!ObjectId.isValid(id)) {
        console.log('Invalid ObjectId');
        return res.status(404).json({ error: 'Not found' });
      }

      // Fetch file document from DB
      const file = await dbClient.db.collection('files').findOne({ _id: new ObjectId(id) });
      if (!file) {
        console.log('File not found in DB');
        return res.status(404).json({ error: 'Not found' });
      }

      console.log(`File retrieved: ${JSON.stringify(file)}`);

      // Check if file is a folder
      if (file.type === 'folder') {
        console.log('File is a folder');
        return res.status(400).json({ error: "A folder doesn't have content" });
      }

      // If file is not public and no user is authenticated
      if (!file.isPublic && !token) {
        console.log('File is not public and no user is authenticated');
        return res.status(404).json({ error: 'Not found' });
      }

      // If file is not public, validate the user
      if (!file.isPublic) {
        console.log('File is not public, validating user...');
        const userId = await redisClient.get(`auth_${token}`);
        if (!userId || userId !== file.userId.toString()) {
          console.log('User is not authorized to access the file');
          return res.status(404).json({ error: 'Not found' });
        }
        console.log('User validated successfully');
      }

      // Check if the file exists on disk
      const localPath = file.localPath;
      if (!localPath) {
        console.log('File localPath is missing');
        return res.status(404).json({ error: 'Not found' });
      }

      try {
        const fileData = await fs.readFile(localPath);
        const mimeType = mime.lookup(file.name) || 'application/octet-stream';
        res.setHeader('Content-Type', mimeType);
        console.log('Returning file content');
        return res.status(200).send(fileData);
      } catch (err) {
        console.error('Error reading file from disk:', err);
        return res.status(404).json({ error: 'Not found' });
      }
    } catch (err) {
      console.error('Error in getFile:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default FilesController;