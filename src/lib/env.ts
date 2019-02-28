import yenv from 'yenv';
import log from './log';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * We just export what `yenv()` returns.
 * `keyblade` will make sure we don't rely on undefined values.
 */
export default yenv('env.yaml', {
  env: process.env.NODE_ENV,
  logBeforeThrow: message => log.error(message),
});
