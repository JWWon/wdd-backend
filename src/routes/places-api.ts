import { createController } from 'awilix-koa';
import { NotFound } from 'fejl';
import { pick } from 'lodash';
import { Context } from '../interfaces/context';
import { ClassInstance, Model } from '../interfaces/model';
import { hasParams } from '../lib/check-params';
import { Place as Class } from '../models/place';

interface LatLng {
  latitude: string | number;
  longitude: string | number;
}

interface CreateInterface extends ClassInstance<Class, 'location'> {
  location: LatLng;
}

interface Search extends LatLng {
  name?: string;
  range?: string; // km
}

type PlaceInterface = ClassInstance<Class>;

const latLngToLocation = ({ latitude, longitude }: LatLng) => {
  const lng = typeof longitude === 'number' ? longitude : parseFloat(longitude);
  const lat = typeof latitude === 'number' ? latitude : parseFloat(latitude);
  return {
    type: 'Point' as 'Point',
    coordinates: [lng, lat] as [number, number],
  };
};

const api = ({ Place }: Model) => ({
  getAll: async (ctx: Context) => {
    return ctx.ok(await Place.find());
  },
  create: async (ctx: Context<CreateInterface>) => {
    const { body } = ctx.request;
    hasParams(['name', 'location', 'address'], body);
    const updateBody: PlaceInterface = {
      ...body,
      location: latLngToLocation(body.location),
    };
    return ctx.created(await Place.create(updateBody));
  },
  searchByLocation: async (ctx: Context<null, Search>) => {
    const { query } = ctx.request;
    hasParams(['latitude', 'longitude'], query);
    const places = await Place.aggregate([
      {
        $geoNear: {
          near: latLngToLocation(pick(query, ['latitude', 'longitude'])),
          maxDistance: query.range ? parseInt(query.range, 10) * 1000 : 500,
          spherical: true,
          distanceField: 'distance',
          distanceMultiplier: 0.001,
        },
      },
    ]);
    NotFound.assert(places.length > 0, '주변 가게를 찾을 수 없습니다.');
    return ctx.ok(places);
  },
});

export default createController(api)
  .prefix('/places')
  .post('', 'create')
  .get('', 'searchByLocation')
  .get('/all', 'getAll');
