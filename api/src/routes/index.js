import auth from './auth';
import connections from './connections';
import create from './create';
import pairwise from './pairwise';
import events from './events';

export default (storage, agent) => ({
  ...auth(storage),
  ...create(agent),
  ...pairwise(agent),
  ...events(storage),
  ...connections(storage),
});
