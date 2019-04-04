import { omit, sample } from 'lodash';
import request from 'supertest';
import { server } from './api-helper';

let sampleUser: any = {
  email: 'feed@sample.com',
  password: 'thisiswoodongdang',
  name: '산책왕',
  // token: string
};

let sampleDog: any = {
  name: sample(['단비', '설이', '일구', '팔육', '초롱이']),
  breed: '푸들',
  gender: 'M',
  // _id: Schema.Types.ObjectId
  // user: Schema.Types.ObjectId
};

const generateFeed = () => ({
  pins: '[{latitude:127.00,longitude:36.0}]',
  seconds: Math.floor(Math.random() * 180),
  distance: Math.random() * 3,
  steps: Math.floor(Math.random() * 5000),
  pees: Math.floor(Math.random() * 10),
  poos: Math.floor(Math.random() * 10),
  memo: '여기 자주 갈 것 같아요~',
  images: [
    'https://picsum.photos/800/800/?random',
    'https://picsum.photos/800/800/?random',
  ],
});

let sampleFeed: any = generateFeed();

const LATITUDE = 0.01;
const LONGITUDE = 0.005;
const DATA_LENGTH = 10;

const center = [127.027021, 37.498289];

const randCoord = (center: number[]) => [
  center[0] + Math.random() * LATITUDE * 2 - LATITUDE,
  center[1] + Math.random() * LONGITUDE * 2 - LONGITUDE,
];

describe('POST /feeds', () => {
  it('should create sample user', async () => {
    const res = await request(server.getInstance())
      .post('/signup')
      .send(sampleUser);
    expect(res.body).toEqual(
      expect.objectContaining(omit(sampleUser, ['password']))
    );
    expect(res.status).toBe(201);
    sampleUser = res.body;
  });

  it('should add dog successfully', async () => {
    expect(sampleUser).toHaveProperty('token');

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
    expect(resUser.body.repDog).toEqual(sampleDog);
    expect(resUser.status).toBe(200);
    sampleUser = resUser.body;
  });

  it('should create sample feed', async () => {
    const res = await request(server.getInstance())
      .post('/feeds')
      .set('authorization', sampleUser.token)
      .send(sampleFeed);
    expect(res.body).toEqual(
      expect.objectContaining({
        ...sampleFeed,
        user: sampleUser._id,
        dog: sampleDog,
      })
    );
    expect(res.status).toBe(201);
    sampleFeed = res.body;

    // Check User
    const resUser = await request(server.getInstance())
      .get('/user')
      .set('authorization', sampleUser.token);
    expect(resUser.body.repDog.feeds).toEqual([sampleFeed._id]);
    expect(resUser.status).toBe(200);
    sampleUser = resUser.body;

    // Check Dog
    const resDog = await request(server.getInstance())
      .get(`/dogs/${sampleDog._id}`)
      .set('authorization', sampleUser.token);
    expect(resDog.body.feeds).toEqual([sampleFeed._id]);
    expect(resDog.status).toBe(200);
    sampleDog = resDog.body;
  });
});

describe('GET /feeds', () => {
  const users: any[] = [];

  it('should create multiple users and dogs nad feeds', async () => {
    for (let i = 0; i < DATA_LENGTH; i += 1) {
      let user: any = {
        email: `feed${i}@example.com`,
        password: `anotheruser${i}`,
        name: `RandomUser${i}`,
        location: { type: 'Point', coordinates: randCoord(center) },
      };
      // Create User
      const resUser = await request(server.getInstance())
        .post('/signup')
        .send(user);
      expect(resUser.status).toBe(201);
      user = resUser.body;

      // Create Dog
      const resDog = await request(server.getInstance())
        .post('/dogs')
        .set('authorization', user.token)
        .send({
          name: `RandomDog${i}`,
          gender: sample(['M', 'F', 'N']),
          breed: sample(['요크셔 테리어', '골든 리트리버', '치와와', '불독']),
        });
      expect(resDog.status).toBe(201);

      // Check User
      const res = await request(server.getInstance())
        .get('/user')
        .set('authorization', user.token);
      expect(res.body.repDog).toEqual(resDog.body);
      expect(res.status).toBe(200);
      user = res.body;

      for (let j = 0; j < Math.floor(Math.random() * 5 + 1); j += 1) {
        // Create Feed
        const resFeed = await request(server.getInstance())
          .post('/feeds')
          .set('authorization', user.token)
          .send(generateFeed());
        expect(resFeed.status).toBe(201);
      }
    }
  });

  it('should search users by location', async () => {
    const res = await request(server.getInstance())
      .get('/user/search')
      .query({
        location: JSON.stringify({ latitude: center[1], longitude: center[0] }),
      });
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    res.body.forEach((user: any) => {
      expect(user.distance).toBeLessThan(1);
      users.push(user);
    });
  });

  it('should get feeds by dogs', async () => {
    const dogs: string[] = users.map((user: any) => {
      return user.repDog._id;
    });
    expect(dogs.length).toBe(users.length);
    const res = await request(server.getInstance())
      .get('/feeds')
      .query({ dogs });
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.status).toBe(200);
    res.body.forEach((feed: any) => {
      expect(dogs).toEqual(expect.arrayContaining([feed.dog._id]));
    });
  });
});
