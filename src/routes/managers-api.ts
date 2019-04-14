import { createController } from 'awilix-koa';
import { BadRequest } from 'fejl';
import { Context } from '../interfaces/context';
import { Model, PureInstance } from '../interfaces/model';
import { loadUser } from '../middleware/load-user';
import { Place as Class } from '../models/place';

interface Data {
  places: PureInstance<Class>[];
}

async function checkManager(ctx: Context, next: any) {
  BadRequest.assert(ctx.user.manager, '관리자가 아닙니다.');
  await next();
}

const api = ({ Place }: Model) => ({
  inviteManager: async (ctx: Context) => {
    ctx.user.manager = true;
    return ctx.ok(await ctx.user.save());
  },
  dropPlaces: async (ctx: Context) => {
    await Place.collection.drop();
    return ctx.noContent({ message: 'Place collection is dropped' });
  },
  insertPlaces: async (ctx: Context<Data>) => {
    const { places } = ctx.request.body;
    const result = await Place.collection.insertMany(places);
    return ctx.created(result.result);
  },
});

export default createController(api)
  .prefix('/manage')
  .before([loadUser])
  .patch('/users', 'inviteManager')
  .delete('/places', 'dropPlaces', { before: [checkManager] })
  .post('/places', 'insertPlaces', { before: [checkManager] });
