import Koa from 'koa';

export interface Context extends Koa.Context {
  send: (status: number, payload: string | object) => void;
  ok: (payload: string | object) => void; // 200
  created: (payload: string | object) => void; // 201
  noContent: (payload: string | object) => void; // 204
  badRequest: (payload: string | object) => void; // 400
  unauthorized: (payload: string | object) => void; // 401
  forbidden: (payload: string | object) => void; // 403
  notFound: (payload: string | object) => void; // 404
  locked: (payload: string | object) => void; // 423
  internalServerError: (payload: string | object) => void; // 500
  notImplemented: (payload: string | object) => void; // 501
}
