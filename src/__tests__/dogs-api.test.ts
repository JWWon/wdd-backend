import { sample } from 'lodash';
import request from 'supertest';
import log from '../lib/log';
import Dog from '../models/dog';
import { server } from './api-helper';

const userInfo = {
  email: 'wonjiwn@naver.com',
  password: 'dnjswldns96',
};

const dogInfo = {
  name: sample(['단비', '설이', '일구', '팔육', '초롱이']),
  breed: '푸들',
  gender: 'M',
};

beforeAll(async () => {
  const drop = await Dog.collection.drop();
  if (drop) {
    log.info('Dropped Dog Collection', { scope: 'mongoose' });
  }
});

describe('POST /dogs', () => {
  let token: string = '';
  it('should get token from User', async () => {
    const app = server.getInstance();
    const resUser = await request(app.callback())
      .post('/signin')
      .send(userInfo);
    if (resUser.status === 200) {
      token = resUser.body.token;
    } else {
      const createUser = await request(app.callback())
        .post('/signup')
        .send({ ...userInfo, name: '원지운' });
      expect(createUser.status).toBe(201);
      token = createUser.body.token;
    }
  });

  it('should create dog successfully', async () => {
    const app = server.getInstance();
    // Create Dog
    const resDog = await request(app.callback())
      .post('/dogs')
      .set('authorization', token)
      .send(dogInfo);
    expect(resDog.body).toEqual(expect.objectContaining(dogInfo));
    expect(resDog.status).toBe(201);
    // Check User
    const res = await request(app.callback())
      .get('/user')
      .set('authorization', token);
    expect(res.body.dogs[Object.keys(res.body.dogs)[0]]).toEqual(
      expect.objectContaining({ name: dogInfo.name, default: true })
    );
    expect(res.status).toBe(200);
  });
});

describe('GET /dogs', () => {
  let token: string = '';
  it('should get token from User', async () => {
    const app = server.getInstance();
    const resUser = await request(app.callback())
      .post('/signin')
      .send(userInfo);
    expect(resUser.status).toBe(200);
    token = resUser.body.token;
  });

  it('should get all dogs successfully', async () => {
    const app = server.getInstance();
    const res = await request(app.callback())
      .get('/dogs')
      .set('authorization', token);
    expect(res.body[0]).toEqual(expect.objectContaining(dogInfo));
    expect(res.status).toBe(200);
  });
});
