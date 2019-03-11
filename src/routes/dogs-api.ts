import { createController } from 'awilix-koa';
import { Context } from '../interfaces/context';
import { Model } from '../interfaces/model';
import { hasParams } from '../lib/check-params';
import { loadUser } from '../middleware/load-user';
import { Dog as Instance } from '../models/dog';

interface Create {
  name: string;
  breed: string;
  gender: 'M' | 'F' | 'N';
  thumbnail?: string;
  user?: string;
}

interface Params {
  id: string;
}

const api = ({ Dog }: Model) => ({
  getAll: async (ctx: Context<null>) => {
    return ctx.ok(await Dog.find({ user: ctx.user._id }));
  },
  create: async (ctx: Context<Create, Params>) => {
    const { body } = ctx.request;
    hasParams(['name', 'breed', 'gender'], body);
    body.user = ctx.user._id;
    const dog = await Dog.create(body);
    await ctx.user.createDog(dog);
    return ctx.created(dog);
  },
  get: async (ctx: Context<null, Params>) => {
    const dog = await Dog.findByParams(ctx.params);
    if (!dog) return;
    return ctx.ok(dog);
  },
  update: async (ctx: Context<Instance, Params>) => {
    const { body } = ctx.request;
    const dog = await Dog.findByParams(ctx.params);
    if (!dog) return;
    const updateDog = await Object.assign(dog, body).save();
    await ctx.user.updateDog(updateDog);
    return ctx.ok(updateDog);
  },
  delete: async (ctx: Context<null, Params>) => {
    const dog = await Dog.findByParams(ctx.params);
    if (!dog) return;
    await ctx.user.deleteDog(dog._id);
    await dog.remove();
    return ctx.noContent({ message: 'Dog Terminated' });
  },
});

export default createController(api)
  .prefix('/dogs')
  .before([loadUser])
  .get('', 'getAll')
  .post('', 'create')
  .get('/:id', 'get')
  .patch('/:id', 'update')
  .delete('/:id', 'delete');
