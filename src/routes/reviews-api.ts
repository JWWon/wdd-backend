import { createController } from 'awilix-koa';
import { Conflict } from 'fejl';
import { Context } from '../interfaces/context';
import { ClassInstance, Model } from '../interfaces/model';
import { hasParams } from '../lib/check-params';
import { loadUser } from '../middleware/load-user';
import Place from '../models/place';
import { Review as Class } from '../models/review';

interface Params {
  id: string;
}

function calcRating(reviews: ClassInstance<Class>[]) {
  let total = 0;
  reviews.forEach(review => (total += review.rating));
  return total / reviews.length;
}

async function updateRating(ctx: Context, next: any) {
  // tslint:disable-next-line:variable-name
  const Review = Class as Model['Review'];
  const review: ClassInstance<Class> = ctx.state.review;
  const place = await Place.findById(review.place);
  if (!place) return ctx.notFound('가게를 찾을 수 없습니다.');

  place.rating = calcRating(await Review.find({ place: review.place }));
  await place.save();
  await next();
}

const api = ({ Review }: Model) => ({
  create: async (ctx: Context<ClassInstance<Class>>) => {
    const { body } = ctx.request;
    hasParams(['place', 'rating'], body);
    Conflict.assert(
      !(await Review.findOne({ place: body.place, user: ctx.user._id })),
      '이미 리뷰를 작성하셨습니다.'
    );
    const review = await Review.create({ ...body, user: ctx.user._id });
    ctx.state = { review }; // pass state for middleware
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
    const updateReview = await Object.assign(review, body).save({
      validateBeforeSave: true,
    });
    ctx.state = { review: updateReview }; // pass state for middleware
    return ctx.ok(updateReview);
  },
  delete: async (ctx: Context<null, null, Params>) => {
    const review = await Review.findByIdAndRemove(ctx.params.id);
    if (!review) return ctx.notFound('리뷰를 찾을 수 없습니다.');
    ctx.state = { review }; // pass state for middleware
    await review.remove();
    return ctx.noContent({ message: 'Review Deleted' });
  },
});

export default createController(api)
  .prefix('/reviews')
  .get('', 'get')
  .post('', 'create', { before: [loadUser], after: [updateRating] })
  .patch('/:id', 'update', { before: [loadUser], after: [updateRating] })
  .delete('/:id', 'delete', { before: [loadUser], after: [updateRating] });
