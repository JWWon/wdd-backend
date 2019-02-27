import log from 'bristol';
import palin from 'palin';

/* istanbul ignore next */
if (process.env.NODE_ENV !== 'production') {
  log.addTarget('console').withFormatter(palin, {
    rootFolderName: 'oboon-backend', // Edit this to match your actual foldername
  });
}

export default log;
