import { sample } from 'lodash';
import request from 'supertest';
import { server } from './api-helper';
// tslint:disable:max-line-length

const LATITUDE = 0.02;
const LONGITUDE = 0.01;
const DATA_LENGTH = 100;

const center = [127.027021, 37.498289];

const randCoord = (center: number[]) => [
  center[0] + Math.random() * LATITUDE * 2 - LATITUDE,
  center[1] + Math.random() * LONGITUDE * 2 - LONGITUDE,
];

export const generatePlace = () => ({
  name: sample([
    '위드 동물병원',
    '한수 동물병원',
    '아이펫 동물병원',
    '래이 동물 의료센터',
    '애니케어 동물병원',
    '코지펫샵',
    '햄스토랑',
    '푸테이블',
    '베베네코',
    '장보는강아지와고양이',
    '강남 똥개',
    '멜리펫',
    '엔젤독',
    '러버독',
    '씨박스',
    '마이펫레시피',
    '나는 펫이다',
  ]),
  label: sample(['카페', '용품', '병원', '기타']),
  location: { type: 'Point', coordinates: randCoord(center) },
  contact: '010-3421-9271',
  thumbnail: 'https://picsum.photos/800/1200/?random',
  address: `${sample([
    '서울특별시 은평구 갈현로 334 2층',
    '서울특별시 강북구 삼양로 458',
    '서울특별시 금천구 독산로 221 1층',
    '서울특별시 성동구 성수이로 51 한라시그마밸리1차 504호',
    '서울특별시 양천구 오목로13길 10',
    '서울특별시 강남구 선릉로76길 38',
    '서울특별시 강남구 논현로 723 3층 302호',
    '서울특별시 성동구 아차산로1길 15',
    '서울특별시 송파구 백제고분로34길 30 1층',
    '서울특별시 동대문구 회기로8길 42',
    '서울특별시 동대문구 망우로12가길 33',
    '서울특별시 강북구 월계로 7 유창빌딩',
    '서울특별시 동대문구 답십리로 82-1',
  ])}`,
  officeHour: ['오전 8:00 ~ 오후 10:00'],
  icon: 'https://picsum.photos/400/400/?random',
  images: [
    'https://picsum.photos/800/800/?random',
    'https://picsum.photos/800/800/?random',
    'https://picsum.photos/800/800/?random',
    'https://picsum.photos/800/800/?random',
  ],
  rating: parseFloat((Math.random() * 5).toFixed(1)),
});

let samplePlace: any = generatePlace();

describe('POST /places', () => {
  it('should create multiple places successfully', async () => {
    for (let i = 0; i < DATA_LENGTH; i += 1) {
      const place = generatePlace();
      const res = await request(server.getInstance())
        .post('/places')
        .send(place);
      expect(res.body).toEqual(expect.objectContaining(place));
      expect(res.status).toBe(201);
    }
  });
});

describe('GET /places', () => {
  it('should get all places', async () => {
    const res = await request(server.getInstance()).get('/places');
    expect(res.body.length).toBeGreaterThanOrEqual(DATA_LENGTH);
    expect(res.status).toBe(200);
  });

  it('should get places near 1km', async () => {
    const res = await request(server.getInstance())
      .get('/places')
      .query({ coordinates: JSON.stringify(center), range: 1 });
    expect(res.body.length).toBeGreaterThan(0);
    res.body.forEach((data: any) => {
      expect(data.distance).toBeLessThan(1);
    });
    expect(res.status).toBe(200);
  });

  it('should get places by label', async () => {
    const label = '카페';
    const res = await request(server.getInstance())
      .get('/places')
      .query({ label });
    expect(res.body.length).toBeGreaterThan(0);
    res.body.forEach((data: any) => {
      expect(data.label).toBe(label);
    });
    expect(res.status).toBe(200);
  });

  it('should get places by keyword', async () => {
    const keyword = '강남';
    const res = await request(server.getInstance())
      .get('/places')
      .query({ keyword });
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.status).toBe(200);
  });
});

describe('PATCH /places/:id', () => {
  it('should create place', async () => {
    const res = await request(server.getInstance())
      .post('/places')
      .send(samplePlace);
    expect(res.status).toBe(201);
    samplePlace = res.body;
  });

  it('should update place', async () => {
    const updatePlace = {
      name: '새로운 가게',
      rating: 5,
      officeHour: ['24시간 오픈'],
    };
    const res = await request(server.getInstance())
      .patch(`/places/${samplePlace._id}`)
      .send(updatePlace);
    expect(res.body).toEqual(expect.objectContaining(updatePlace));
    expect(res.status).toBe(200);
    samplePlace = res.body;
  });
});

// describe('PATCH /places/:id/scrap', () => {
//   let user: any = {
//     email: 'place@sample.com',
//     password: 'sampleplaceaccount',
//     name: 'MySample',
//   };

//   it('should create sample user', async () => {
//     const res = await request(server.getInstance())
//       .post('/signup')
//       .send(user);
//     expect(res.status).toBe(201);
//     user = res.body;
//   });
// });
