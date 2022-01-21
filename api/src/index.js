import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import jwt from 'express-jwt';
import { Validator } from 'express-json-validator-middleware';
import session from 'express-session';
import crypto from 'crypto';

import log from './log';
import agent from './agent';
import routes from './routes';
import storage from './storage';
import conf from './config';

class Stream {
  // eslint-disable-next-line class-methods-use-this
  write(text) {
    log.info(text);
  }
}

const init = async (config) => {
  const { validate } = new Validator();
  const jwtMw = jwt({
    secret: config.auth.jwtSharedSecret,
    algorithms: ['HS256'],
  }).unless({
    path: [/\/auth/i],
  });
  const appStorage = await storage(config);
  const appAgent = await agent(appStorage, config);

  const app = express();
  const appRoutes = await routes(appStorage, appAgent, config);

  const { port } = config;

  if (config.devMode) {
    log.info('Running in dev mode');
    app.use(
      cors({
        origin: config.auth.apps['findy-issuer-app'].redirectUrl,
        credentials: true, // for session cookie
      }),
    );
  }
  app.use(jwtMw);
  app.use(morgan('combined', { stream: new Stream() }));
  app.use(express.json());

  app.use(
    // sessions stored in memory - note: not for production use
    session({
      secret: crypto.randomBytes(20).toString('hex'),
      saveUninitialized: true,
      resave: true,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        secure: !config.devMode,
      },
    }),
  );
  app.get('/auth/config', (req, res) =>
    res.json(appRoutes.getIntegrationConfig()),
  );
  app.get('/auth/dev', appRoutes.devModeLogin);
  app.get('/auth/callback/findy-issuer-app', appRoutes.githubLogin);
  app.get('/auth/isb', appRoutes.isbSendCred);

  app.get('/user', async (req, res) => {
    const user = await appStorage.getUser(req.user.email);
    return res.json(user);
  });
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
  app.get('/creds/isb-url', appRoutes.isbGetUrlForPairwise);

  app.listen(port, () => log.info(`Issuer tool listening on port ${port}!`));
};

(async () => {
  const { validate: validateConfig, config } = await conf();

  await validateConfig();
  await init(config);
})();
