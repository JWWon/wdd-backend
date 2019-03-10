import { createController } from 'awilix-koa';
import { BadRequest } from 'fejl';
import { Schema } from 'mongoose';
import { Context } from '../interfaces/context';
import { Model } from '../interfaces/model';
import { checkAuth } from '../middleware/check-auth';
import { Dog as Instance } from '../models/dog';

interface Params {
  _id: Schema.Types.ObjectId;
}

const getId = (ctx: Context<{}, Params>) => {
  BadRequest.assert(ctx.params._id, 'No id given');
  return ctx.params._id;
};

const api = ({ Dog }: Model) => ({
  getAll: async (ctx: Context<{}>) => {
    return ctx.ok(await Dog.find({ user: ctx.user._id }));
  },
  create: async (ctx: Parameters<typeof Dog.createDog>[0]) => {
    const dog = await Dog.createDog(ctx);
    const user = await ctx.user.createDog(dog);
    if (user) return ctx.created(dog);
    return ctx.badRequest({ message: '댕댕이 생성에 실패하였습니다.' });
  },
  get: async (ctx: Parameters<typeof getId>[0]) => {
    const dog = await Dog.findById(getId(ctx));
    if (dog) return ctx.ok(dog);
    return ctx.notFound('존재하지 않는 댕댕이입니다.');
  },
  update: async (ctx: Context<Instance, Params>) => {
    let dog = await Dog.findById(getId(ctx));
    if (dog) {
      dog = Object.assign(dog, ctx.request.body);
      await dog.save({ validateBeforeSave: true });
      await ctx.user.updateDog(dog);
      return ctx.ok(dog);
    }
    return ctx.notFound({ message: '댕댕이를 찾지 못했습니다.' });
  },
  delete: async (ctx: Parameters<typeof getId>[0]) => {
    // update user instance
    const id = (getId(ctx) as any) as string;
    await Dog.remove(getId(ctx));
    const user = await ctx.user.deleteDog(id);
    if (user) return ctx.noContent({ message: '댕댕이 삭제에 성공했습니다.' });
    return ctx.badRequest({ message: '댕댕이 삭제에 실패했습니다' });
  },
});

export default createController(api)
  .prefix('/dogs')
  .before([checkAuth])
  .get('', 'getAll')
  .post('', 'create')
  .get('/:id', 'get')
  .patch('/:id', 'update')
  .delete('/:id', 'delete');
