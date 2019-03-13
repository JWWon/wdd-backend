import { createController } from 'awilix-koa';
import { NotFound } from 'fejl';
import { pick } from 'lodash';
import { Context } from '../interfaces/context';
import { ClassInstance, Model } from '../interfaces/model';
import { hasParams } from '../lib/check-params';
import { Place as Class } from '../models/place';

type Instance = ClassInstance<Class>;

interface Search {
  coordinates?: [number, number];
  name?: string;
  range?: string; // km
}

interface Response extends Instance {
  distance: number; // km
}

const MAX_DISTANCE = 300;

const api = ({ Place }: Model) => ({
  create: async (ctx: Context<Instance>) => {
    const { body } = ctx.request;
    hasParams(['name', 'location', 'address'], body);
    const place = await Place.create(body);
    return ctx.created(place);
  },
  search: async (ctx: Context<null, Search>) => {
    const { query } = ctx.request;
    let places: Response[] = [];
    if (query.coordinates) {
      places = await Place.aggregate([
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: query.coordinates,
            },
            maxDistance: query.range
              ? parseInt(query.range, 10) * 1000
              : MAX_DISTANCE,
            spherical: true,
            distanceField: 'distance',
            distanceMultiplier: 0.001,
          },
        },
      ]);
    } else {
      places = await Place.find().lean();
    }
    NotFound.assert(places.length > 0, '주변 가게를 찾을 수 없습니다.');
    return ctx.ok(places);
  },
});

export default createController(api)
  .prefix('/places')
  .post('', 'create')
  .get('', 'search');
