import { createController } from 'awilix-koa';
import { Conflict } from 'fejl';
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
    hasParams(['place', 'rating'], body);
    Conflict.assert(
      !(await Review.findOne({ place: body.place, user: ctx.user._id })),
      '이미 리뷰를 작성하셨습니다.'
    );
    return ctx.created(await Review.create({ ...body, user: ctx.user._id }));
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
    await review.remove();
    return ctx.noContent({ message: 'Review Deleted' });
  },
});

export default createController(api)
  .prefix('/reviews')
  .get('', 'get')
  .post('', 'create', { before: [loadUser] })
  .patch('/:id', 'update', { before: [loadUser] })
  .delete('/:id', 'delete', { before: [loadUser] });
