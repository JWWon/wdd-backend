import request from 'supertest';
import log from '../lib/log';
import User from '../models/user';
import { server } from './api-helper';

const userInfo = {
  email: 'wonjiwn@naver.com',
  password: 'dnjswldns96',
  name: '원지운',
};

beforeAll(async () => {
  const drop = await User.collection.drop();
  if (drop) {
    log.info('Dropped User Collection', { scope: 'mongoose' });
  }
});

describe('POST /signup', () => {
  it('should create user successfully', async () => {
    const app = server.getInstance();
    const res = await request(app.callback())
      .post('/signup')
      .send(userInfo);

    expect(res.body).toEqual(
      expect.objectContaining({ email: userInfo.email, name: userInfo.name })
    );
    expect(res.status).toBe(201);
  });
});

describe('POST /signin', () => {
  it('should get NotFound with wrong email and password', async () => {
    const app = server.getInstance();
    const res = await request(app.callback())
      .post('/signin')
      .send({ email: 'wrong@email.com', password: 'thisiswrong' });
    expect(res.status).toBe(404); // NonFound
  });

  it('should get NotAuthenticated with wrong password', async () => {
    const app = server.getInstance();
    const res = await request(app.callback())
      .post('/signin')
      .send({ email: userInfo.email, password: 'thisiswrong' });
    expect(res.status).toEqual(401); // NotAuthenticated
  });

  it('should signin successfully', async () => {
    const app = server.getInstance();
    const res = await request(app.callback())
      .post('/signin')
      .send({ email: userInfo.email, password: userInfo.password });
    expect(res.body).toEqual(
      expect.objectContaining({ email: userInfo.email })
    );
    expect(res.status).toBe(200);
  });
});

describe('POST /forgot-password', () => {
  it('should send email correctly', async () => {});
});
