import { pick, sample } from 'lodash';
import request from 'supertest';
import log from '../lib/log';
import User from '../models/user';
import { server } from './api-helper';

let sampleUser: any = {
  email: `${sample(['baemin', 'example', 'lalala'])}@${sample([
    'naver.com',
    'gmail.com',
    'daum.net',
  ])}`,
  name: '테스트계정임다',
  // token: string
};
const password = sample(['thisispassword', 'hellomyoldspo']);

beforeAll(async () => {
  if (await User.collection.drop()) {
    log.info('Dropped User Collection', { scope: 'mongoose' });
  }
});

describe('POST /signup', () => {
  it('should create user successfully', async () => {
    const res = await request(server.getInstance())
      .post('/signup')
      .send({ ...sampleUser, password });

    expect(res.body).toEqual(
      expect.objectContaining(pick(sampleUser, ['email', 'name']))
    );
    expect(res.status).toBe(201);
    sampleUser = res.body;
  });
});

describe('POST /signin', () => {
  it('should get NotFound with wrong email and password', async () => {
    const res = await request(server.getInstance())
      .post('/signin')
      .send({ email: 'wrong@email.com', password: 'thisiswrong' });
    expect(res.status).toBe(404); // NotFound
  });

  it('should get NotAuthenticated with wrong password', async () => {
    const res = await request(server.getInstance())
      .post('/signin')
      .send({ email: sampleUser.email, password: 'thisiswrong' });
    expect(res.status).toEqual(401); // NotAuthenticated
  });

  it('should signin successfully', async () => {
    const res = await request(server.getInstance())
      .post('/signin')
      .send({ password, email: sampleUser.email });
    expect(res.body).toEqual(
      expect.objectContaining(pick(sampleUser, ['email', 'name']))
    );
    expect(res.status).toBe(200);
  });
});

describe('PATCH /user', () => {
  it('should update user successfully', async () => {
    expect(sampleUser).toHaveProperty('token');

    const data = { name: '개명했어요', gender: 'F' };
    const res = await request(server.getInstance())
      .patch('/user')
      .set('authorization', sampleUser.token)
      .send(data);
    expect(res.body).toEqual(expect.objectContaining(data));
    expect(res.status).toBe(200);
  });
});

describe('POST /forgot-password', () => {
  it('should send email successfully', async () => {});
});
