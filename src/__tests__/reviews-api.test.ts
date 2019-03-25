import { pick } from 'lodash';
import request from 'supertest';
import log from '../lib/log';
import Review from '../models/review';
import { server } from './api-helper';
import { generatePlace } from './places-api.test';
// tslint:disable:max-line-length

let sampleUser: any = {
  email: 'hello@there.com',
  password: 'thisiswoodongdang',
  // token: string
};

let samplePlace: any = generatePlace();

let sampleReview: any = {
  rating: Math.round(Math.random() * 5),
};

beforeAll(async () => {
  if (await Review.collection.drop()) {
    log.info('Dropped Review Collection', { scope: 'mongoose' });
  }
});

describe('POST /reviews', () => {
  it('should get token from User', async () => {
    const resSignIn = await request(server.getInstance())
      .post('/signin')
      .send(sampleUser);
    if (resSignIn.status === 200) {
      sampleUser = resSignIn.body;
    } else {
      const resSignUp = await request(server.getInstance())
        .post('/signup')
        .send({ ...sampleUser, name: '원지운' });
      expect(resSignUp.status).toBe(201);
      sampleUser = resSignUp.body;
    }
  });

  it('should create random place', async () => {
    const res = await request(server.getInstance())
      .post('/places')
      .send(samplePlace);
    expect(res.body).toEqual(expect.objectContaining(samplePlace));
    expect(res.status).toBe(201);
    samplePlace = res.body;
    sampleReview.place = samplePlace._id;
  });

  it('should create review', async () => {
    const res = await request(server.getInstance())
      .post('/reviews')
      .set('authorization', sampleUser.token)
      .send(sampleReview);
    expect(res.body).toEqual(
      expect.objectContaining(pick(sampleReview, ['rating', 'place']))
    );
    expect(res.status).toBe(201);
    sampleReview = res.body;
  });

  it('should get right rating', async () => {
    const res = await request(server.getInstance()).get(
      `/places/${samplePlace._id}`
    );
    expect(res.body).toEqual(
      expect.objectContaining({ rating: sampleReview.rating })
    );
    samplePlace = res.body;
  });
});

describe('GET /reviews', () => {
  it('should get reviews by place', async () => {
    const place = samplePlace._id;
    const res = await request(server.getInstance())
      .get('/reviews')
      .query({ place });
    res.body.forEach((data: any) => {
      expect(data).toEqual(expect.objectContaining({ place }));
    });
    expect(res.status).toBe(200);
  });

  it('should get reviews by user', async () => {
    const user = sampleUser._id;
    const res = await request(server.getInstance())
      .get('/reviews')
      .query({ user });
    res.body.forEach((data: any) => {
      expect(data.user._id).toBe(user);
    });
    expect(res.status).toBe(200);
  });
});
