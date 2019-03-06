import request from 'supertest';
import log from '../lib/log';
import User from '../models/user';
import { server } from './api-helper';

const correct = {
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
  it('should create user successfully', async done => {
    const app = server.getInstance();
    request(app.callback())
      .post('/signup')
      .send(correct)
      .expect(res => {
        res.body.email = correct.email;
        res.body.name = correct.name;
        res.body.password = undefined;
      })
      .expect(201, done);
  });
});

describe('POST /signin', () => {
  it('should not signin with wrong email and password', async done => {
    const app = server.getInstance();
    request(app.callback())
      .post('/signin')
      .send({ email: 'wrong@email.com', password: 'thisiswrong' })
      .expect(404, done);
  });

  it('should signin successfully', async done => {
    const app = server.getInstance();
    request(app.callback())
      .post('/signin')
      .send({ email: correct.email, password: correct.password })
      .expect(200, done);
  });
});
