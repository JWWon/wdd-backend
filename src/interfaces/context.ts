import Koa from 'koa';
import { Context as Ctx } from 'koa-respond';
import { InstanceType } from 'typegoose';
import { User } from '../models/user';

interface Request<B, Q> extends Koa.Request {
  body: B;
  query: Q;
}

export interface Context<Body = null, Query = null, Params = null> extends Ctx {
  user: InstanceType<User>;
  request: Request<Body, Query>;
  params: Params;
  state: any;
}
