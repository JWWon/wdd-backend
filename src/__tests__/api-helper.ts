import http from 'http';
import { createServer } from '../lib/server';

class Server {
  static instance: http.Server;

  constructor() {
    if (!Server.instance) {
      Server.instance = createServer();
    }
  }

  getInstance = () => Server.instance;
}

const server = new Server();

export { server };
