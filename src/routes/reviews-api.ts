import { createController } from 'awilix-koa';
import { MethodNotAllowed } from 'fejl';
import { findIndex } from 'lodash';
import { Context } from '../interfaces/context';
import { ClassInstance, Model } from '../interfaces/model';
import { hasParams } from '../lib/check-params';
import { loadUser } from '../middleware/load-user';
import { Review as Class } from '../models/review';

interface Params {
  id: string;
}

const api = ({ Review }: Model) => ({
  create: async (ctx: Context<ClassInstance<Class>>) => {
    const { body } = ctx.request;
    hasParams(['user', 'place', 'rating'], body);
    MethodNotAllowed.assert(
      !(await Review.findOne({ place: body.place, user: body.user })),
      '이미 리뷰를 작성하셨습니다.'
    );
    const review = await Review.create(body);
    // push review on User model
    ctx.user.places.push({ _id: review._id, type: 'REVIEW' });
    await ctx.user.save({ validateBeforeSave: true });
    return ctx.created(review);
  },
  get: async (ctx: Context<null, Pick<Class, 'user' | 'place'>>) => {
    const { query } = ctx.request;
    return ctx.ok(await Review.find(query));
  },
  update: async (ctx: Context<ClassInstance<Class>, null, Params>) => {
    const { body } = ctx.request;
    const review = await Review.findById(ctx.params.id);
    if (!review) return ctx.notFound('리뷰를 찾을 수 없습니다.');
    return ctx.ok(
      await Object.assign(review, body).save({ validateBeforeSave: true })
    );
  },
  delete: async (ctx: Context<null, null, Params>) => {
    const review = await Review.findByIdAndRemove(ctx.params.id);
    if (!review) return ctx.notFound('리뷰를 찾을 수 없습니다.');
    // delete review on User model
    ctx.user.places.splice(
      findIndex(ctx.user.places, place => place === review._id),
      1
    );
    await ctx.user.save({ validateBeforeSave: true });
    return ctx.noContent({ message: 'Review Deleted' });
  },
});

export default createController(api)
  .prefix('/reviews')
  .get('', 'get')
  .post('', 'create', { before: [loadUser] })
  .patch('/:id', 'update', { before: [loadUser] })
  .delete('/:id', 'delete', { before: [loadUser] });
