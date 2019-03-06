import { createController } from 'awilix-koa';
import { Context } from '../interfaces/context';
import { Model } from '../interfaces/model';

const api = ({ User }: Model) => ({
  getUser: async (ctx: Context) => null,
});

export default createController(api);
