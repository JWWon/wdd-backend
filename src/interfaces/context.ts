import Koa from 'koa';
import { Context as Ctx } from 'koa-respond';
import { InstanceType } from 'typegoose';
import { Dog } from '../models/dog';
import { Feed } from '../models/feed';
import { Place } from '../models/place';
import { User } from '../models/user';

interface Request<B, Q> extends Koa.Request {
  body: B;
  query: Q;
}

export interface Context<Body = null, Query = null, Params = null> extends Ctx {
  user: InstanceType<User>;
  request: Request<Body, Query>;
  params: Params;
  state: {
    dog: InstanceType<Dog>;
    place: InstanceType<Place>;
    feed: InstanceType<Feed>;
  };
}
