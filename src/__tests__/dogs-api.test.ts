import { sample } from 'lodash';
import request from 'supertest';
import { server } from './api-helper';

let sampleUser: any = {
  email: 'dog@sample.com',
  password: 'samplepassword',
  // token: string
  // repDog: Dog
  // dogs: { [key: string]: string }
};

let sampleDog: any = {
  name: sample(['단비', '설이', '일구', '팔육', '초롱이']),
  breed: '푸들',
  gender: 'M',
  // _id: Schema.Types.ObjectId
  // user: Schema.Types.ObjectId
};

describe('POST /dogs', () => {
  it('should create sample user', async () => {
    const res = await request(server.getInstance())
      .post('/signup')
      .send({ ...sampleUser, name: '댕댕이주인' });
    expect(res.status).toBe(201);
    sampleUser = res.body;
  });

  it('should create dog', async () => {
    expect(sampleUser).toHaveProperty('token');

    // Create Dog
    const res = await request(server.getInstance())
      .post('/dogs')
      .set('authorization', sampleUser.token)
      .send(sampleDog);
    expect(res.body).toEqual(expect.objectContaining(sampleDog));
    expect(res.status).toBe(201);
    sampleDog = res.body;

    // Check User
    const resUser = await request(server.getInstance())
      .get('/user')
      .set('authorization', sampleUser.token);
    const { dogs, repDog } = resUser.body;
    expect(dogs[Object.keys(dogs)[0]]).toBe(sampleDog.name);
    expect(repDog).toEqual(sampleDog);
    expect(resUser.status).toBe(200);
    sampleUser = resUser.body;
  });
});

describe('GET /dogs', () => {
  it('should get all dogs successfully', async () => {
    expect(sampleUser).toHaveProperty('token');

    const res = await request(server.getInstance())
      .get('/dogs')
      .set('authorization', sampleUser.token);
    expect(res.body).toEqual(expect.arrayContaining([sampleDog]));
    expect(res.status).toBe(200);
  });
});

describe('GET /dogs/:id', () => {
  it('should get single dog', async () => {
    expect(sampleUser).toHaveProperty('token');

    const res = await request(server.getInstance())
      .get(`/dogs/${sampleDog._id}`)
      .set('authorization', sampleUser.token);
    expect(res.body).toEqual(sampleDog);
    expect(res.status).toBe(200);
  });
});

describe('PATCH /dogs/:id', () => {
  it('should update dog', async () => {
    expect(sampleUser).toHaveProperty('token');

    // Update Dog
    const updateData = {
      thumbnail: 'https://picsum.photos/800/800/?random',
      name: '댕댕쓰',
    };
    const res = await request(server.getInstance())
      .patch(`/dogs/${sampleDog._id}`)
      .set('authorization', sampleUser.token)
      .send(updateData);
    expect(res.body).toEqual(expect.objectContaining(updateData));
    expect(res.status).toBe(200);
    sampleDog = res.body;

    // Check User
    const resUser = await request(server.getInstance())
      .get('/user')
      .set('authorization', sampleUser.token);
    const { dogs } = resUser.body;
    expect(dogs[Object.keys(dogs)[0]]).toBe(sampleDog.name);
    expect(resUser.status).toBe(200);
    sampleUser = resUser.body;
  });
});

describe('PUT /dogs/:id', () => {
  let anotherDog = { name: '새댕댕이', breed: '치와와', gender: 'N' };

  it('should create another dog', async () => {
    expect(sampleUser).toHaveProperty('token');

    // Create Dog
    const res = await request(server.getInstance())
      .post('/dogs')
      .set('authorization', sampleUser.token)
      .send(anotherDog);
    expect(res.body).toEqual(expect.objectContaining(anotherDog));
    expect(res.status).toBe(201);
    anotherDog = res.body;

    // Check User
    const resUser = await request(server.getInstance())
      .get('/user')
      .set('authorization', sampleUser.token);
    const { dogs, repDog } = resUser.body;
    expect(dogs[Object.keys(dogs)[1]]).toBe(anotherDog.name);
    expect(repDog).toEqual(anotherDog);
    expect(resUser.status).toBe(200);
    sampleUser = resUser.body;
  });

  it('should change represent dog', async () => {
    expect(sampleUser).toHaveProperty('token');

    // Change RepDog
    const res = await request(server.getInstance())
      .put(`/dogs/${sampleDog._id}`)
      .set('authorization', sampleUser.token);
    expect(res.body).toEqual(sampleDog);
    expect(res.status).toBe(200);

    // Check User
    const resUser = await request(server.getInstance())
      .get('/user')
      .set('authorization', sampleUser.token);
    expect(resUser.body.repDog).toEqual(sampleDog);
    expect(res.status).toBe(200);
    sampleUser = resUser.body;
  });
});
