import auth from './auth';
import connections from './connections';
import create from './create';
import pairwise from './pairwise';
import events from './events';
import ftn from './ftn';

export default async (storage, agent, config, ftnService) => {
  const authRoutes = await auth(storage, config);
  const ftnRoutes = await ftn(ftnService, config);
  return {
    ...authRoutes,
    ...create(agent, config),
    ...pairwise(agent, config),
    ...events(storage, config),
    ...connections(storage, config),
    ...ftnRoutes,
  };
};
