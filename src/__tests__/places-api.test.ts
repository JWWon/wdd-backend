import { pick, sample } from 'lodash';
import request from 'supertest';
import log from '../lib/log';
import Place from '../models/place';
import { server } from './api-helper';
// tslint:disable:max-line-length

const LATITUDE = 0.02;
const LONGITUDE = 0.015;
const DATA_LENGTH = 30;

const center = { latitude: 37.498625, longitude: 127.026995 };

const randLocation = (center: { latitude: number; longitude: number }) => ({
  latitude: center.latitude + Math.random() * LATITUDE * 2 - LATITUDE,
  longitude: center.longitude + Math.random() * LONGITUDE * 2 - LONGITUDE,
});

const generatePlace = () => ({
  name: sample([
    '카카오프렌즈',
    '댕댕이 병원',
    '생선사개',
    '우리동네댕댕이',
    '1986',
    '일구야 놀자',
    '몽구쓰',
  ]),
  location: randLocation(center),
  address: `서울특별시 강남구 ${sample([
    '역삼동 821',
    '역삼1동 816-3',
    '역삼동 강남대로 358',
  ])}`,
  officeHour: {
    default: '오전 8:00 ~ 오후 10:00',
    weekend: '오전 10:00 ~ 오후 9:00',
  },
  images: [
    'https://lh3.googleusercontent.com/HzwfjrydoIU84qOhwXmGViwjQUE_iLUFanPsvALG4cVFLnCxWCCjBnlGT6hWQC9l=w408-h306-k-no',
    'https://lh5.googleusercontent.com/proxy/zDbBz8XGRzekQ1jaCGS-cv-848xMyXNrP0ewgPTgCCJYgIYUeQzEucORfepZ-Do87NSszmCiAse1TXnvcQ_SsOeQNeZ3WMUYOAJMrjVAyhmyOUJlmiL9jOWzRntyV3pXhibdU9UDQGY8xVVbQIXys1AbcB5nPg=w408-h272-k-no',
  ],
});

beforeAll(async () => {
  if (await Place.collection.drop()) {
    log.info('Dropped Place Collection', { scope: 'mongoose' });
  }
});

describe('POST /places', () => {
  it('should create multiple places successfully', async () => {
    const app = server.getInstance();
    for (let i = 0; i < DATA_LENGTH; i += 1) {
      const place = generatePlace();
      const res = await request(app.callback())
        .post('/places')
        .send(place);
      expect(res.body).toEqual(
        expect.objectContaining(
          pick(place, ['name', 'address', 'officeHour', 'images'])
        )
      );
      expect(res.status).toBe(201);
    }
  });
});

describe('GET /places', () => {
  it('should get all places', async () => {
    const app = server.getInstance();
    const res = await request(app.callback()).get('/places');
    expect(res.body.length).toBe(DATA_LENGTH);
    expect(res.status).toBe(200);
  });

  it('should get places near 1km', async () => {
    const app = server.getInstance();
    const res = await request(app.callback())
      .get('/places')
      .query({ ...center, range: 1 });
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.status).toBe(200);
  });
});
