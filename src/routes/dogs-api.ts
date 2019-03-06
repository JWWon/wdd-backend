import { createController } from 'awilix-koa';
import { BadRequest } from 'fejl';
import { Schema } from 'mongoose';
import { InstanceType } from 'typegoose';
import { Context } from '../interfaces/context';
import { Model } from '../interfaces/model';
import { checkAuth } from '../middleware/check-auth';
import { Dog } from '../models/dog';

type DogInstance = InstanceType<Dog>;

const getId = (ctx: Context<{}, { _id: Schema.Types.ObjectId }>) => {
  BadRequest.assert(ctx.params._id, 'No id given');
  return { _id: ctx.params._id };
};

const api = ({ Dog }: Model) => ({
  getAll: async (ctx: Context<{}>) => {
    return ctx.ok(await Dog.find({ user: ctx.user.email }));
  },
  create: async (ctx: Parameters<typeof Dog.createDog>[0]) => {
    const dog = await Dog.createDog(ctx);
    const user = await ctx.user.createDog(dog);
    if (user) return ctx.created(dog);
    return ctx.badRequest({ message: '사용자 업데이트에 실패했습니다.' });
  },
  get: async (ctx: Parameters<typeof getId>[0]) => {
    const dog = await Dog.findOne(getId(ctx));
    if (dog) return ctx.ok(dog);
    return ctx.notFound('존재하지 않는 댕댕이입니다.');
  },
  update: async (ctx: Context<DogInstance, { _id: Schema.Types.ObjectId }>) => {
    const dog = await Dog.update(getId(ctx), ctx.request.body);
    await ctx.user.updateDog(dog);
    return ctx.ok(dog);
  },
  delete: async (ctx: Parameters<typeof getId>[0]) => {
    // update user instance
    await Dog.remove(getId(ctx));
    const user = await ctx.user.deleteDog(ctx);
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
