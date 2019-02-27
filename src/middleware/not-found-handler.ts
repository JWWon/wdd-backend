import { Context } from '../lib/server';

export async function notFoundHandler(ctx: Context) {
  const msg = `${ctx.request.method} ${ctx.request.path}`;
  ctx.notFound({
    message: `No endpoint matched your request: ${msg}`,
  });
}
