import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';
import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import Bull from 'bull';

const fileQueue = new Bull('fileQueue');

class FilesController {
  static async postUpload(req, res) {
    try {
      const token = req.headers['x-token'];
      if (!token) return res.status(401).json({ error: 'Unauthorized' });

      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const { name, type, parentId = 0, isPublic = false, data } = req.body;

      if (!name) return res.status(400).json({ error: 'Missing name' });
      if (!type || !['folder', 'file', 'image'].includes(type)) {
        return res.status(400).json({ error: 'Missing type' });
      }
      if (type !== 'folder' && !data) {
        return res.status(400).json({ error: 'Missing data' });
      }

      let parentFile = null;
      if (parentId !== 0) {
        parentFile = await dbClient.db.collection('files').findOne({ _id: new ObjectId(parentId) });
        if (!parentFile) return res.status(400).json({ error: 'Parent not found' });
        if (parentFile.type !== 'folder') return res.status(400).json({ error: 'Parent is not a folder' });
      }

      const fileDocument = {
        userId: new ObjectId(userId),
        name,
        type,
        isPublic,
        parentId: parentId === 0 ? '0' : new ObjectId(parentId),
      };

      const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
      if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

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

      const localPath = path.join(folderPath, uuidv4());
      fs.writeFileSync(localPath, Buffer.from(data, 'base64'));
      fileDocument.localPath = localPath;

      const result = await dbClient.db.collection('files').insertOne(fileDocument);

      // Enqueue a job for thumbnail generation for image files
      if (type === 'image') {
        fileQueue.add({
          fileId: result.insertedId.toString(),
          userId,
        });
      }

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
      const { id } = req.params;
      const { size } = req.query;
      const token = req.headers['x-token'] || null;

      console.log('Fetching file data...');
      const file = await dbClient.db.collection('files').findOne({ _id: new ObjectId(id) });

      if (!file) {
        console.log('File not found');
        return res.status(404).json({ error: 'Not found' });
      }

      if (file.type === 'folder') {
        console.log('File is a folder');
        return res.status(400).json({ error: "A folder doesn't have content" });
      }

      const isPublic = file.isPublic;
      let userId = null;

      if (token) {
        const key = `auth_${token}`;
        console.log(`Fetching user ID from Redis with key: ${key}`);
        userId = await redisClient.get(key);
      }

      if (!isPublic && (!userId || userId !== file.userId.toString())) {
        console.log('File is private and user is unauthenticated or not the owner');
        return res.status(404).json({ error: 'Not found' });
      }

      let filePath = file.localPath;
      if (size) {
        const validSizes = ['100', '250', '500'];
        if (!validSizes.includes(size)) return res.status(400).json({ error: 'Invalid size' });
        filePath = `${file.localPath}_${size}`;
      }

      if (!fs.existsSync(filePath)) {
        console.log('File not found on disk');
        return res.status(404).json({ error: 'Not found' });
      }

      const mimeType = mime.lookup(file.name);
      res.setHeader('Content-Type', mimeType);
      const fileContent = fs.readFileSync(filePath);
      return res.status(200).send(fileContent);
    } catch (err) {
      console.error('Error in GET /files/:id/data:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default FilesController;