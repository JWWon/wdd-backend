import Dog from '../models/dog';
import Feed from '../models/feed';
import Place from '../models/place';
import Review from '../models/review';
import User from '../models/user';

export interface Model {
  Dog: typeof Dog;
  Place: typeof Place;
  Feed: typeof Feed;
  User: typeof User;
  Review: typeof Review;
}

export type PureInstance<T, P = ''> = Pick<
  T,
  Exclude<keyof T, 'getModelForClass' | 'setModelForClass' | P>
>;
