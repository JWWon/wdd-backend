import request from 'supertest';
import log from '../lib/log';
import Review from '../models/review';
import { server } from './api-helper';
// tslint:disable:max-line-length

let sampleUser: any = {
  email: 'hello@there.com',
  password: 'thisiswoodongdang',
  // token: string
};

let samplePlace: any = {
  name: '우리동네댕댕이',
  label: 'CAFE',
  location: { type: 'Point', coordinates: [127.027021, 37.498289] },
  contact: '010-3421-9271',
  address: '서울특별시 강남구 역삼동 821',
  officeHour: {
    default: '오전 8:00 ~ 오후 10:00',
    weekend: '오전 10:00 ~ 오후 9:00',
  },
  images: [
    'https://lh3.googleusercontent.com/HzwfjrydoIU84qOhwXmGViwjQUE_iLUFanPsvALG4cVFLnCxWCCjBnlGT6hWQC9l=w408-h306-k-no',
    'https://lh5.googleusercontent.com/proxy/zDbBz8XGRzekQ1jaCGS-cv-848xMyXNrP0ewgPTgCCJYgIYUeQzEucORfepZ-Do87NSszmCiAse1TXnvcQ_SsOeQNeZ3WMUYOAJMrjVAyhmyOUJlmiL9jOWzRntyV3pXhibdU9UDQGY8xVVbQIXys1AbcB5nPg=w408-h272-k-no',
  ],
  rating: parseFloat((Math.random() * 5).toFixed(1)),
};

let sampleReview: any = {
  rating: 4,
};

beforeAll(async () => {
  try {
    if (await Review.collection.drop()) {
      log.info('Dropped Review Collection', { scope: 'mongoose' });
    }
  } catch (e) {
    log.debug('Collection not exist', { scope: 'mongoose' });
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
    expect(res.body).toEqual(expect.objectContaining(sampleReview));
    expect(res.status).toBe(201);
    sampleReview = res.body;
  });
});
