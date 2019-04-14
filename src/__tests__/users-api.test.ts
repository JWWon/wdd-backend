import { pick, sample } from 'lodash';
import request from 'supertest';
import { server } from './api-helper';

let sampleUser: any = {
  email: 'user@sample.com',
  name: '테스트',
};
const password = sample(['thisispassword', 'samplepassword']);

const center = [127.027021, 37.498289];
const LATITUDE = 0.02;
const LONGITUDE = 0.01;

const randCoord = (center: number[]) => [
  center[0] + Math.random() * LATITUDE * 2 - LATITUDE,
  center[1] + Math.random() * LONGITUDE * 2 - LONGITUDE,
];

describe('POST /signup', () => {
  it('should create user', async () => {
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
  it("shouldn't signin with wrong email and password", async () => {
    const res = await request(server.getInstance())
      .post('/signin')
      .send({ email: 'wrong@email.com', password: 'thisiswrong' });
    expect(res.status).toBe(404); // NotFound
  });

  it("shouldn't signin with wrong password", async () => {
    const res = await request(server.getInstance())
      .post('/signin')
      .send({ email: sampleUser.email, password: 'thisiswrong' });
    expect(res.status).toEqual(401); // NotAuthenticated
  });

  it('should signin', async () => {
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
  it('should update user', async () => {
    expect(sampleUser).toHaveProperty('token');

    const data = { name: '개명했어요', gender: 'F' };
    const res = await request(server.getInstance())
      .patch('/user')
      .set('authorization', sampleUser.token)
      .send(data);
    expect(res.body).toEqual(expect.objectContaining(data));
    expect(res.status).toBe(200);
  });

  it('should change password', async () => {
    const password = 'mynewpassword';
    const res = await request(server.getInstance())
      .patch('/user')
      .set('authorization', sampleUser.token)
      .send({ password });
    expect(res.status).toBe(200);
  });

  it('should update location', async () => {
    const location = { type: 'Point', coordinates: randCoord(center) };
    const res = await request(server.getInstance())
      .patch('/user')
      .set('authorization', sampleUser.token)
      .send({ location });
    expect(res.body.location).toEqual(location);
    expect(res.status).toBe(200);
    sampleUser = res.body;
  });
});

describe('POST /forgot-password', () => {
  it('should send email', async () => {
    const { email } = sampleUser;
    const res = await request(server.getInstance())
      .post('/forgot-password')
      .send({ email });
    expect(res.body.email).toBe(email);
    expect(res.status).toBe(200);
  });
});

describe('GET /user/search', () => {
  const user = {
    email: 'search@sample.com',
    password: 'userforsearch',
    name: '구글',
    location: { type: 'Point', coordinates: [127.027131, 37.498872] },
  };

  it('should create another user', async () => {
    const res = await request(server.getInstance())
      .post('/signup')
      .send(user);
    expect(res.status).toBe(201);
  });
});
