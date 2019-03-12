import { createController } from 'awilix-koa';
import { NotFound } from 'fejl';
import { pick } from 'lodash';
import { Context } from '../interfaces/context';
import { ClassInstance, Model } from '../interfaces/model';
import { hasParams } from '../lib/check-params';
import { LatLng, latLngToLocation, locationToLatLng } from '../lib/location';
import { Place as Class } from '../models/place';

type Interface = ClassInstance<Class>;
type WebInterface<T = Interface> = Pick<T, Exclude<keyof T, 'location'>> & {
  location: LatLng;
};

interface Search {
  latitude?: string;
  longitude?: string;
  name?: string;
  range?: string; // km
}

interface Response extends Interface {
  distance: number; // km
}

const MAX_DISTANCE = 300;

const placeForWeb = <T = null>(place: T & Interface) =>
  Object.assign(place, {
    location: locationToLatLng(place.location),
  }) as WebInterface<T>;

const api = ({ Place }: Model) => ({
  create: async (ctx: Context<WebInterface>) => {
    const { body } = ctx.request;
    hasParams(['name', 'location', 'address'], body);
    const updateBody: Interface = {
      ...body,
      location: latLngToLocation(body.location),
    };
    const place = await Place.create(updateBody);
    return ctx.created(placeForWeb(place));
  },
  search: async (ctx: Context<null, Search>) => {
    const { query } = ctx.request;
    let places: Response[] = [];
    if ('latitude' in query && 'longitude' in query) {
      places = await Place.aggregate([
        {
          $geoNear: {
            near: latLngToLocation(pick(query, [
              'latitude',
              'longitude',
            ]) as LatLng),
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
    const converted = places.map(place => placeForWeb(place));
    return ctx.ok(converted);
  },
});

export default createController(api)
  .prefix('/places')
  .post('', 'create')
  .get('', 'search');
