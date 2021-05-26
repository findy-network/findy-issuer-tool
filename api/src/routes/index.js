import auth from './auth';
import connections from './connections';
import create from './create';
import pairwise from './pairwise';
import events from './events';

export default (storage, agent, config) => ({
  ...auth(storage, config),
  ...create(agent, config),
  ...pairwise(agent, config),
  ...events(storage, config),
  ...connections(storage, config),
});
