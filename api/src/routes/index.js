import auth from './auth';
import connections from './connections';
import create from './create';
import pairwise from './pairwise';
import events from './events';

export default async (storage, agent, config) => ({
  ...(await auth(storage, config, agent.pairwiseSendCredential)),
  ...create(agent, config),
  ...pairwise(agent, config),
  ...events(storage, config),
  ...connections(storage, config),
});
