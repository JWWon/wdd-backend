import Koa from 'koa';
import { createServer } from '../lib/server';

class Server {
  static instance: Koa;

  constructor() {
    if (!Server.instance) this.setInstance();
  }

  getInstance() {
    return Server.instance;
  }

  setInstance() {
    createServer().then((app: Koa) => {
      Server.instance = app;
    });
  }
}

const server = new Server();

export { server };
