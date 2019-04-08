import { createController } from 'awilix-koa';
import { Conflict, NotFound } from 'fejl';
import * as Hangul from 'hangul-js';
import { find, findIndex } from 'lodash';
import mongoose from 'mongoose';
import { Context } from '../interfaces/context';
import { Model, PureInstance } from '../interfaces/model';
import { hasParams } from '../lib/check-params';
import { calcDistance, queryLocation } from '../lib/helper';
import { loadUser } from '../middleware/load-user';
import Table, { Place as Class } from '../models/place';

type Instance = PureInstance<Class>;

interface Search {
  keyword?: string;
  label?: string;
  coordinates?: string; // [longitude, latitude]
  range?: string; // km
  places?: string;
}

interface PlaceWithDist extends Instance {
  distance: number; // km
}

interface Params {
  id: string;
}

function disassembleKorean(text: string) {
  return Hangul.disassembleToString(text.replace(/\s/g, ''));
}

function createQuery(place: Instance) {
  return disassembleKorean([place.name, place.address].join(''));
}

// middleware
async function loadPlace(ctx: Context<null, null, Params>, next: any) {
  const place = await Table.findById(ctx.params.id);
  NotFound.assert(place, '가게를 찾을 수 없습니다.');
  if (!place) return;
  ctx.state.place = place;
  await next();
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
    if (q.coordinates) {
      query.location = queryLocation(JSON.parse(q.coordinates), q.range);
    }
    if (q.places) {
      const places: string[] = JSON.parse(q.places);
      query._id = {
        $in: places.map(place => mongoose.Types.ObjectId(place)),
      };
    }

    const places: Instance[] = await Place.find(query)
      .sort('-rating')
      .lean();
    if (q.coordinates) {
      const coordinates: number[] = JSON.parse(q.coordinates);
      const placesWithDist: PlaceWithDist[] = places.map(place => ({
        ...place,
        distance: calcDistance(coordinates, place.location.coordinates),
      }));
      return ctx.ok(placesWithDist);
    }
    return ctx.ok(places);
  },
  get: async (ctx: Context) => {
    return ctx.ok(ctx.state.place);
  },
  update: async (ctx: Context<Instance, null, Params>) => {
    const { body } = ctx.request;
    const updatePlace = Object.assign(ctx.state.place, body);
    updatePlace.query = createQuery(updatePlace);
    return ctx.ok(await updatePlace.save({ validateBeforeSave: true }));
  },
  delete: async (ctx: Context) => {
    await ctx.state.place.remove();
    return ctx.noContent({ message: 'Place Deleted' });
  },
  scrap: async (ctx: Context) => {
    const { place } = ctx.state;
    Conflict.assert(
      find(ctx.user.places, scrap => place._id.equals(scrap)) === undefined,
      '해당 가게를 이미 스크랩했습니다.'
    );
    place.scraps.push({ user: ctx.user._id, createdAt: new Date() });
    ctx.user.places.push(place._id);
    await ctx.user.save({ validateBeforeSave: true });
    return ctx.ok(await place.save({ validateBeforeSave: true }));
  },
  unScrap: async (ctx: Context) => {
    const { place } = ctx.state;
    const placeIndex = findIndex(ctx.user.places, scrap =>
      place._id.equals(scrap)
    );
    NotFound.assert(placeIndex > -1, '해당 가게를 스크랩한 기록이 없습니다.');
    const scrapIndex = findIndex(
      place.scraps,
      scrap => scrap.user === ctx.user._id
    );
    place.scraps.splice(scrapIndex, 1);
    ctx.user.places.splice(placeIndex, 1);
    await ctx.user.save({ validateBeforeSave: true });
    return ctx.ok(await place.save({ validateBeforeSave: true }));
  },
});

export default createController(api)
  .prefix('/places')
  .post('', 'create')
  .get('', 'search')
  .get('/:id', 'get', { before: [loadPlace] })
  .patch('/:id', 'update', { before: [loadPlace] })
  .delete('/:id', 'delete', { before: [loadPlace] })
  .patch('/:id/scrap', 'scrap', { before: [loadUser, loadPlace] })
  .delete('/:id/scrap', 'unScrap', { before: [loadUser, loadPlace] });
