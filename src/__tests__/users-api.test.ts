import { pick, sample } from 'lodash';
import request from 'supertest';
import { PureInstance } from '../interfaces/model';
import { Serialized, User as Class } from '../models/user';
import { server } from './api-helper';

type UserInstance =
  | Pick<PureInstance<Class>, 'email' | 'name'>
  | PureInstance<Serialized>;

let sampleUser: UserInstance = {
  email: 'user@sample.com',
  name: '테스트',
};
const password = sample(['thisispassword', 'samplepassword']);

describe('POST /signup', () => {
  it('should create user', async () => {
    const res = await request(server.getInstance())
      .post('/signup')
      .send({ ...sampleUser, password });

    expect(res.body as PureInstance<Serialized>).toEqual(
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
    expect(res.body as PureInstance<Serialized>).toEqual(
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
      .set('authorization', (sampleUser as PureInstance<Serialized>).token)
      .send(data);
    expect(res.body as PureInstance<Serialized>).toEqual(
      expect.objectContaining(data)
    );
    expect(res.status).toBe(200);
  });

  it('should change password', async () => {
    const password = 'mynewpassword';
    const res = await request(server.getInstance())
      .patch('/user')
      .set('authorization', (sampleUser as PureInstance<Serialized>).token)
      .send({ password });
    expect(res.status).toBe(200);
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
