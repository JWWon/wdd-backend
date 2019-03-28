import { createController } from 'awilix-koa';
import { Conflict, NotFound } from 'fejl';
import * as Hangul from 'hangul-js';
import { find, findIndex, flatten, orderBy } from 'lodash';
import { Context } from '../interfaces/context';
import { ClassInstance, Model } from '../interfaces/model';
import { hasParams } from '../lib/check-params';
import { loadUser } from '../middleware/load-user';
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

function disassembleKorean(text: string) {
  return Hangul.disassembleToString(text.replace(/\s/g, ''));
}

function createQuery(place: Instance) {
  return disassembleKorean([place.name, place.address].join(''));
}

const api = ({ Place }: Model) => ({
  create: async (ctx: Context<Instance>) => {
    const { body } = ctx.request;
    hasParams(['name', 'location', 'address', 'contact', 'thumbnail'], body);
    body.query = createQuery(body);
    return ctx.created(await Place.create(body));
  },
  search: async (ctx: Context<null, Search>) => {
    const { query: q } = ctx.request;
    const query: { [key: string]: any } = {};
    if (q.label) query.label = q.label;
    if (q.keyword) {
      query.query = { $regex: disassembleKorean(q.keyword), $options: 'g' };
    }
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
    const places: Instance[] = await Place.find(query)
      .sort({ rating: 1 })
      .lean();
    if (q.location) {
      const coord = latLngToCoord(q.location);
      const placesWithDist: PlaceWithDist[] = places.map(place => ({
        ...place,
        distance: calcDistance(coord, place.location.coordinates),
      }));
      return ctx.ok(placesWithDist);
    }
    return ctx.ok(places);
  },
  get: async (ctx: Context<null, null, Params>) => {
    const place = await Place.findById(ctx.params.id);
    if (!place) return ctx.notFound('가게를 찾을 수 없습니다.');
    return ctx.ok(place);
  },
  update: async (ctx: Context<Instance, null, Params>) => {
    const { body } = ctx.request;
    const place = await Place.findById(ctx.params.id);
    if (!place) return ctx.notFound('가게를 찾을 수 없습니다.');
    const updatePlace = Object.assign(place, body);
    updatePlace.query = createQuery(updatePlace);
    return ctx.ok(await updatePlace.save({ validateBeforeSave: true }));
  },
  delete: async (ctx: Context<null, null, Params>) => {
    const place = await Place.findById(ctx.params.id);
    if (!place) return ctx.notFound('가게를 찾을 수 없습니다.');
    await place.remove();
    return ctx.noContent({ message: 'Place Deleted' });
  },
  getByLikeUser: async (ctx: Context<null>) => {
    return ctx.ok(await Place.find({ likes: ctx.user._id }));
  },
  doLike: async (ctx: Context<null, null, Params>) => {
    const place = await Place.findById(ctx.params.id);
    if (!place) return ctx.notFound('가게를 찾을 수 없습니다.');
    Conflict.assert(
      find(place.likes, like => like === ctx.user._id),
      '이미 좋아요를 눌렀습니다.'
    );
    place.likes.push(ctx.user._id);
    return ctx.ok(await place.save({ validateBeforeSave: true }));
  },
  undoLike: async (ctx: Context<null, null, Params>) => {
    const place = await Place.findById(ctx.params.id);
    if (!place) return ctx.notFound('가게를 찾을 수 없습니다.');
    const index = findIndex(place.likes, like => like === ctx.user._id);
    NotFound.assert(index > -1, '좋아요를 누르지 않았습니다.');
    place.likes.splice(index, 1);
    return ctx.ok(await place.save({ validateBeforeSave: true }));
  },
});

export default createController(api)
  .prefix('/places')
  .post('', 'create')
  .get('', 'search')
  .get('/:id', 'get')
  .patch('/:id', 'update')
  .delete('/:id', 'delete')
  .get('/:id/likes', 'getByLikeUser', { before: [loadUser] })
  .post('/:id/likes', 'doLike', { before: [loadUser] })
  .delete('/:id/likes', 'doLike', { before: [loadUser] });
