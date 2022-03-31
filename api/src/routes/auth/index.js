import jwt from 'jsonwebtoken';

import github from './github';
import dev from './dev';
import isb from './isb';
import findy from './findy';
import log from '../../log';

export default async (storage, config) => {
  const { addOrUpdateUser } = storage;

  const createToken = async (name, email, id) => {
    await addOrUpdateUser({ name, email, id: id.toString() });
    return jwt.sign({ name, email }, config.auth.jwtSharedSecret, {
      expiresIn: '24h',
    });
  };

  const ghLogin = github(createToken, config);
  const devLogin = dev(createToken, config);
  const isbCred = await isb(addOrUpdateUser, config);
  let findyLogin = null;
  try {
    findyLogin = await findy(createToken, config);
  } catch (err) {
    log.error('Unable to init findy login: ', err);
  }

  const getConfig = (req) => {
    const conf = {
      auth: {
        dev: { url: devLogin.getUrl() },
        github: { url: ghLogin.getUrl() },
        ...(findyLogin ? { findy: { url: findyLogin.getUrl(req) } } : {}),
      },
      creds: {
        ftn: { url: isbCred.getUrl() },
      },
    };
    return conf;
  };
  return {
    getIntegrationConfig: getConfig,
    githubLogin: ghLogin.githubLoginIssuer,
    devModeLogin: devLogin.devLogin,
    findyLogin: findyLogin ? findyLogin.findyOIDCCallback : () => {},
    isbGetUrlForEmail: isbCred.getUrlForEmailForRequest,
    isbCallback: isbCred.isbCallback,
  };
};
