import request from 'supertest';
import { createServer } from '../lib/server';

describe('GET api', () => {
  it('should return 200 OK', async () => {
    const app = await createServer();
    return request(app.callback())
      .get('/')
      .expect(200);
  });
});
