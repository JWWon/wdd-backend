import Dog from '../models/dog';
import Feed from '../models/feed';
import Place from '../models/place';
import User from '../models/user';

export interface Model {
  Dog: typeof Dog;
  Place: typeof Place;
  Feed: typeof Feed;
  User: typeof User;
}

export type ClassInstance<T, P = ''> = Pick<
  T,
  Exclude<keyof T, 'getModelForClass' | 'setModelForClass' | P>
>;
