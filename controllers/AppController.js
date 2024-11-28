import redisClient from '../utils/redis';
import dbClient from '../utils/db';

export default class AppController {
  static getStatus(request, response) {
    console.log('Redis isAlive:', redisClient.isAlive());
    console.log('DB isAlive:', dbClient.isAlive());
    response.status(200).json({
      redis: redisClient.isAlive(),
      db: dbClient.isAlive(),
    });
  }

  static async getStats(req, res) {
    const users = await dbClient.nbUsers();
    const files = await dbClient.nbFiles();
    res.status(200).send({
      users,
      files,
    });
  }
}
