import { createController } from 'awilix-koa';
import { Conflict, NotFound } from 'fejl';
import { Schema } from 'mongoose';
import { Context } from '../interfaces/context';
import { Model, PureInstance } from '../interfaces/model';
import { hasParams } from '../lib/check-params';
import { loadUser } from '../middleware/load-user';
import Place from '../models/place';
import Table, { Review as Class } from '../models/review';

interface Params {
  id: string;
}

// helper
const updateRating = async (placeId: Schema.Types.ObjectId) => {
  const place = await Place.findById(placeId);
  NotFound.assert(place, '가게를 찾을 수 없습니다.');
  if (!place) return;

  let total = 0;
  const reviews = await Table.find({ place: placeId });
  if (reviews.length > 0) {
    reviews.forEach(review => (total += review.rating));
    place.rating = total / reviews.length;
  } else {
    place.rating = 0;
  }
  await place.save();
};

async function loadReview(ctx: Context<null, null, Params>, next: any) {
  const review = await Table.findById(ctx.params.id);
  NotFound.assert(review, '리뷰를 찾을 수 없습니다.');
  if (!review) return;
  ctx.state.review = review;
  await next();
}

const api = ({ Review }: Model) => ({
  create: async (ctx: Context<PureInstance<Class>>) => {
    const { body } = ctx.request;
    hasParams(['place', 'rating'], body);
    Conflict.assert(
      !(await Review.findOne({ place: body.place, user: ctx.user._id })),
      '이미 리뷰를 작성하셨습니다.'
    );
    const review = await Review.create({ ...body, user: ctx.user._id });
    await updateRating(review.place);
    return ctx.created(Object.assign(review, { user: ctx.user }));
  },
  get: async (ctx: Context<null, Pick<Class, 'user' | 'place'>>) => {
    const { query } = ctx.request;
    return ctx.ok(await Review.find(query).populate('user'));
  },
  update: async (ctx: Context<PureInstance<Class>>) => {
    const { body } = ctx.request;
    const updateReview = await Object.assign(ctx.state.review, body).save({
      validateBeforeSave: true,
    });
    await updateRating(updateReview.place);
    return ctx.ok(Object.assign(updateReview, { user: ctx.user }));
  },
  delete: async (ctx: Context) => {
    const { place } = ctx.state.review;
    await ctx.state.review.remove();
    await updateRating(place);
    return ctx.noContent({ message: 'Review Deleted' });
  },
  report: async (ctx: Context) => {
    const { review } = ctx.state;
    review.reports.push(ctx.user._id);
    review.markModified('reports');
    await review.save();
    return ctx.ok({ message: '신고가 접수되었습니다.' });
  },
});

export default createController(api)
  .prefix('/reviews')
  .get('', 'get')
  .post('', 'create', { before: [loadUser] })
  .patch('/:id', 'update', { before: [loadUser, loadReview] })
  .delete('/:id', 'delete', { before: [loadUser, loadReview] })
  .post('/:id/report', 'report', { before: [loadUser, loadReview] });
