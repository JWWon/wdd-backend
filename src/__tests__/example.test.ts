import request from 'supertest';
import { server } from './api-helper';

describe('GET api', () => {
  it('should return 200 OK', async () => {
    const app = server.getInstance();
    return request(app.callback())
      .get('/')
      .expect(200);
  });
});
