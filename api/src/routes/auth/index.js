import jwt from 'jsonwebtoken';

import github from './github';
import dev from './dev';
import isb from './isb';
import findy from './findy';

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
  const findyLogin = await findy(createToken, config);

  const getConfig = (req) => {
    const conf = {
      auth: {
        dev: { url: devLogin.getUrl() },
        github: { url: ghLogin.getUrl() },
        findy: { url: findyLogin.getUrl(req) },
      },
      creds: {
        isb: { url: isbCred.getUrl() },
      },
    };
    return conf;
  };
  return {
    getIntegrationConfig: getConfig,
    githubLogin: ghLogin.githubLoginIssuer,
    devModeLogin: devLogin.devLogin,
    findyLogin: findyLogin.findyOIDCCallback,
    isbGetUrlForEmail: isbCred.getUrlForEmail,
    isbSendCred: isbCred.isbCallback,
  };
};
