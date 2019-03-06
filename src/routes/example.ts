import { createController } from 'awilix-koa';
import { Context } from '../interfaces/context';

const api = ({}) => ({
  get: async (ctx: Context) => ctx.ok('hello world!'),
});

export default createController(api).get('', 'get');
