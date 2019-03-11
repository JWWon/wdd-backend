import Koa from 'koa';
import { Context as Ctx } from 'koa-respond';
import { InstanceType } from 'typegoose';
import { User } from '../models/user';

interface Request<Body> extends Koa.Request {
  body: Body;
}

export interface Context<Body, Params = {}> extends Ctx {
  user: InstanceType<User>;
  request: Request<Body>;
  params: Params;
}
