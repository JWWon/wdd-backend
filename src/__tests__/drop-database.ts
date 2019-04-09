import mongoose from 'mongoose';
import env from '../lib/env';

module.exports = () => {
  mongoose
    .connect(`mongodb://${env.DB_URL}/woodongdang`, {
      autoReconnect: true,
      useNewUrlParser: true,
      useCreateIndex: true,
    })
    .then(async mongo => {
      const { connection } = mongo;
      await connection.dropDatabase();
    });
};
