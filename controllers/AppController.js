import redisClient from '../utils/redis';
import dbClient from '../utils/db';

export default class AppController {
  static getStatus(request, response) {
    console.log('Redis Status:', redisClient.isAlive());
    console.log('DB Status:', dbClient.isAlive());
    response.status(200).send({
      redis: redisClient.isAlive(),
      db: dbClient.isAlive(),
    });
  }

  static async getStats(request, response) {
    const usersCount = await dbClient.nbUsers();
    const filesCount = await dbClient.nbFiles();
    console.log('Users Count:', usersCount);
    console.log('Files Count:', filesCount);
    response.status(200).send({
      users: usersCount,
      files: filesCount,
    });
  }
}
