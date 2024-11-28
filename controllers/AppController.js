import redisClient from '../utils/redis';
import dbClient from '../utils/db';

export default class AppController {
  static getStatus(request, response) {
    const redisStatus = redisClient.isAlive();
    const dbStatus = dbClient.isAlive();
    response.status(200).send({ redis: redisStatus, db: dbStatus });
  }

  static async getStats(request, response) {
    const usersCount = await dbClient.nbUsers();
    const filesCount = await dbClient.nbFiles();
    response.status(200).send({ users: usersCount, files: filesCount });
  }
}
