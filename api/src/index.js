import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import { expressjwt as jwt } from 'express-jwt';
import { Validator } from 'express-json-validator-middleware';
import session from 'express-session';
import crypto from 'crypto';

import log from './log';
import agent from './agent';
import routes from './routes';
import storage from './storage';
import conf from './config';
import ftn from './ftn';

class Stream {
  // eslint-disable-next-line class-methods-use-this
  write(text) {
    log.info(text);
  }
}

const sleep = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const defaultCredDefs = [
  {
    id: 'github',
    attributes: ['id', 'name', 'email'],
  },
  {
    id: 'ftn',
    attributes: [
      'name',
      'given_name',
      'family_name',
      'birthdate',
      'personal_identity_code',
      'auth_time',
    ],
  },
];

const init = async (config) => {
  const { validate } = new Validator();
  const jwtMw = jwt({
    secret: config.auth.jwtSharedSecret,
    algorithms: ['HS256'],
  }).unless({
    path: [/\/auth/i, /\/ftn/i],
  });
  const appStorage = await storage(config);
  const appAgent = await agent(appStorage, config);
  const ftnService = await ftn(appStorage, appAgent, config);
  await appAgent.startListening(ftnService);

  const ledgerHasDefault =
    config.skipDefaultCredDefs ||
    (await appStorage.getLedger()).credDefs.find((item) =>
      defaultCredDefs.find(
        (credDef) =>
          item.toLowerCase().indexOf(credDef.id.toLowerCase()) !== -1,
      ),
    );
  if (!ledgerHasDefault) {
    log.info('Creating default cred defs...');

    const createDefaultCredDefs = async () => {
      const schemaIds = await Promise.all(
        defaultCredDefs.map((item) =>
          appAgent.createSchema({
            name: item.id,
            version: '1.0',
            attrs: item.attributes,
          }),
        ),
      );
      return Promise.all(
        schemaIds.map(async (id, index) => {
          let tries = 0;
          // sometimes write to ledger takes some time
          // so we wait for the schema to be found on ledger
          while (tries < 10) {
            tries += 1;
            try {
              // eslint-disable-next-line no-await-in-loop
              await appAgent.getSchema(id);
              tries = 10;
            } catch (err) {
              sleep(1000);
            }
          }
          return appAgent.createCredDef({
            schemaId: id,
            tag: defaultCredDefs[index].id,
          });
        }),
      );
    };
    await createDefaultCredDefs();
  } else {
    log.info('Default cred defs already exist');
  }

  const app = express();
  const appRoutes = await routes(appStorage, appAgent, config, ftnService);

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

  // sessions stored in memory - note: not for production use
  const sessionProps = {
    secret: crypto.randomBytes(20).toString('hex'),
    saveUninitialized: true,
    resave: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
    }, // TODO: secure for production
  };
  app.use(session(sessionProps));
  app.get('/auth/config', (req, res) =>
    res.json(appRoutes.getIntegrationConfig(req)),
  );
  app.get('/auth/dev', appRoutes.devModeLogin);
  app.get('/auth/callback/findy-issuer-app', appRoutes.githubLogin);
  app.get('/auth/isb', appRoutes.isbCallback);
  app.get('/auth/findy', appRoutes.findyLogin);

  app.get('/ftn/start', appRoutes.ftnStart);
  app.get('/ftn/status', appRoutes.ftnStatus);
  app.get('/ftn/auth', appRoutes.ftnAuth);
  app.get('/ftn/callback', appRoutes.ftnCallback);

  app.get('/user', async (req, res) => {
    const user = await appStorage.getUser(req.auth.email);
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
  app.get('/creds/isb-url', appRoutes.isbGetUrlForEmail);

  app.listen(port, () => log.info(`Issuer tool listening on port ${port}!`));
};

(async () => {
  const { validate: validateConfig, config } = await conf();

  await validateConfig();
  await init(config);
})();
