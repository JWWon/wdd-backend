import { createController } from 'awilix-koa';
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
  label?: string;
  location?: string;
  range?: string; // km
}

interface PlaceWithDist extends Instance {
  distance: number; // km
}

interface Params {
  id: string;
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
    hasParams(['name', 'location', 'address', 'contact'], body);
    return ctx.created(await Place.create(body));
  },
  search: async (ctx: Context<null, Search>) => {
    const { query: q } = ctx.request;
    const query: { [key: string]: any } = {};
    if (q.label) query.label = q.label;
    if (q.keyword) query['$text'] = { $search: q.keyword };
    if (q.location) {
      query.location = {
        $near: {
          $maxDistance: q.range ? parseFloat(q.range) * 1000 : MAX_DISTANCE,
          $geometry: {
            type: 'Point',
            coordinates: latLngToCoord(q.location),
          },
        },
      };
    }
    const places: Instance[] = await Place.find(query).lean();
    if (q.location) {
      const coord = latLngToCoord(q.location);
      const placesWithDist: PlaceWithDist[] = places.map(place => ({
        ...place,
        distance: calcDistance(coord, place.location.coordinates),
      }));
      return ctx.ok(orderBy(placesWithDist, 'distance', 'asc'));
    }
    return ctx.ok(places);
  },
  update: async (ctx: Context<Instance, null, Params>) => {
    const { body } = ctx.request;
  },
});

export default createController(api)
  .prefix('/places')
  .post('', 'create')
  .get('', 'search')
  .patch('/:id', 'update');
