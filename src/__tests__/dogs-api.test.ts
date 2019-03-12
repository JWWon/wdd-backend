import { sample } from 'lodash';
import request from 'supertest';
import log from '../lib/log';
import Dog from '../models/dog';
import { server } from './api-helper';

let sampleUser: any = {
  email: 'wonjiwn@naver.com',
  password: 'dnjswldns96',
  // token: string
};

let sampleDog: any = {
  name: sample(['단비', '설이', '일구', '팔육', '초롱이']),
  breed: '푸들',
  gender: 'M',
  // _id: Schema.Types.ObjectId
  // user: Schema.Types.ObjectId
};

beforeAll(async () => {
  const drop = await Dog.collection.drop();
  if (drop) {
    log.info('Dropped Dog Collection', { scope: 'mongoose' });
  }
});

describe('POST /dogs', () => {
  it('should get token from User', async () => {
    const app = server.getInstance();
    const resSignIn = await request(app.callback())
      .post('/signin')
      .send(sampleUser);
    if (resSignIn.status === 200) {
      sampleUser = resSignIn.body;
    } else {
      const resSignUp = await request(app.callback())
        .post('/signup')
        .send({ ...sampleUser, name: '원지운' });
      expect(resSignUp.status).toBe(201);
      sampleUser = resSignUp.body;
    }
  });

  it('should create dog successfully', async () => {
    expect(sampleUser).toHaveProperty('token');
    const app = server.getInstance();
    // Create Dog
    const resCreate = await request(app.callback())
      .post('/dogs')
      .set('authorization', sampleUser.token)
      .send(sampleDog);
    expect(resCreate.body).toEqual(expect.objectContaining(sampleDog));
    expect(resCreate.status).toBe(201);
    sampleDog = resCreate.body;

    // Check User
    const res = await request(app.callback())
      .get('/user')
      .set('authorization', sampleUser.token);
    expect(res.body.dogs[Object.keys(res.body.dogs)[0]]).toEqual(
      expect.objectContaining({ name: sampleDog.name, default: true })
    );
    expect(res.status).toBe(200);
  });
});

describe('GET /dogs', () => {
  it('should get all dogs successfully', async () => {
    expect(sampleUser).toHaveProperty('token');
    const app = server.getInstance();
    const res = await request(app.callback())
      .get('/dogs')
      .set('authorization', sampleUser.token);
    expect(res.body).toEqual(expect.arrayContaining([sampleDog]));
    expect(res.status).toBe(200);
  });
});

describe('PATCH /dogs/:id', () => {
  it('should update dog successfully', async () => {
    expect(sampleUser).toHaveProperty('token');
    const app = server.getInstance();
    const updateData = {
      thumbnail: 'https://www.example.com/image.png',
      name: '테스트 댕댕이',
    };
    const res = await request(app.callback())
      .patch(`/dogs/${sampleDog._id}`)
      .set('authorization', sampleUser.token)
      .send(updateData);
    expect(res.body).toEqual(expect.objectContaining(updateData));
    expect(res.status).toBe(200);
  });
});
