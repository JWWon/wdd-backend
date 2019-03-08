import log from 'bristol';
import palin from 'palin';

/* istanbul ignore next */
if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
  log.addTarget('console').withFormatter(palin, {
    rootFolderName: 'wdd-backend', // Edit this to match your actual foldername
  });
}

export default log;
