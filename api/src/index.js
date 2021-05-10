import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import jwt from 'express-jwt';
import config from 'config';
import { Validator } from 'express-json-validator-middleware';

import log from './log';
import agent from './agent';
import routes from './routes';
import storage from './storage';

class Stream {
  // eslint-disable-next-line class-methods-use-this
  write(text) {
    log.info(text);
  }
}

const init = async () => {
  const { validate } = new Validator();
  const jwtMw = jwt({
    secret: config.auth.jwtSharedSecret,
    algorithms: ['HS256'],
  }).unless({
    path: [/\/auth/i, '/issuer'],
  });
  const appStorage = await storage();
  const appAgent = await agent(appStorage);

  const app = express();
  const appRoutes = routes(appStorage, appAgent);

  const { port } = config;

  if (config.storage.devMode) {
    app.use(cors());
  }
  app.use(jwtMw);
  app.use(morgan('combined', { stream: new Stream() }));
  app.use(express.json());

  app.get('/auth/callback/findy-issuer-app', appRoutes.githubLoginIssuer);

  app.get('/user', (req, res) => res.json(req.user));
  app.get('/ledger', async (req, res) =>
    res.json(await appStorage.getLedger()),
  );
  app.get('/events/log', appRoutes.getEventLog);
  app.get('/connections', appRoutes.getConnections);

  app.post('/create/schema', ...appRoutes.createSchemaRoute(validate));
  app.post('/create/cred-def', ...appRoutes.createCredDefRoute(validate));
  app.post(
    '/pairwise/invitation',
    ...appRoutes.pairwiseInvitationRoute(validate),
  );
  app.post(
    '/pairwise/basic-message',
    ...appRoutes.pairwiseSendMessageRoute(validate),
  );
  app.post(
    '/pairwise/proof-request',
    ...appRoutes.pairwiseSendProofRequestRoute(validate),
  );
  app.post(
    '/pairwise/credential',
    ...appRoutes.pairwiseSendCredentialRoute(validate),
  );

  app.listen(port, () => log.info(`Issuer tool listening on port ${port}!`));
};

(async () => {
  await init();
})();
