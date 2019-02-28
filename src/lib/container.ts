import {
  asValue,
  createContainer,
  InjectionMode,
  Lifetime
  } from 'awilix';
import log from './log';

export function configureContainer() {
  const opts = {
    // Classic means Awilix will look at function parameter
    // names rather than passing a Proxy.
    injectionMode: InjectionMode.PROXY,
  };
  return createContainer(opts)
    .loadModules(['models/*.js'], {
      // `modulesToLoad` paths should be relative
      // to this file's parent directory.
      cwd: `${__dirname}/..`,
      formatName: name =>
        name.replace(
          /\w+/g,
          w => w[0].toUpperCase() + w.slice(1).toLowerCase()
        ),
      resolverOptions: {
        register: asValue,
        lifetime: Lifetime.SINGLETON,
      },
    })
    .register({
      // Our logger is already constructed,
      // so provide it as-is to anyone who wants it.
      logger: asValue(log),
    });
}
