import { createController } from 'awilix-koa';
import { NotFound } from 'fejl';
import { orderBy } from 'lodash';
import { Context } from '../interfaces/context';
import { ClassInstance, Model } from '../interfaces/model';
import { hasParams } from '../lib/check-params';
import { Place as Class } from '../models/place';

type Instance = ClassInstance<Class>;

interface LatLng {
  latitude: number;
  longitude: number;
}

interface Search {
  keyword?: string;
  location?: string;
  range?: string; // km
}

interface Response extends Instance {
  distance: number; // km
}

const MAX_DISTANCE = 300;

// Helpers
function latLngToCoord(location: string) {
  const { latitude, longitude }: LatLng = JSON.parse(location);
  return [longitude, latitude];
}

function calcDistance(posX: number[], posY: number[]) {
  const p = 0.017453292519943295; // Math.PI / 180
  const c = Math.cos;
  const a =
    0.5 -
    c((posY[1] - posX[1]) * p) / 2 +
    (c(posX[1] * p) * c(posY[1] * p) * (1 - c((posY[0] - posX[0]) * p))) / 2;

  return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}

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
    if (query.location) {
      const coordinates = latLngToCoord(query.location);
      places = await Place.find({
        location: {
          $near: {
            $maxDistance: query.range
              ? parseInt(query.range, 10) * 1000
              : MAX_DISTANCE,
            $geometry: {
              coordinates,
              type: 'Point',
            },
          },
        },
      }).lean();
      places = places.map(place => ({
        ...place,
        distance: calcDistance(coordinates, place.location.coordinates),
      }));
      places = orderBy(places, 'distance', 'asc'); // 거리 순으로 정렬
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
