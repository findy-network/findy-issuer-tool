import jwt from 'jsonwebtoken';

import github from './github';
import dev from './dev';
import isb from './isb';

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
  const isbCred = await isb(() => {}, config);

  const getConfig = () => {
    const conf = {
      auth: {
        dev: { url: devLogin.getUrl() },
        github: { url: ghLogin.getUrl() },
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
    isbGetUrlForPairwise: isbCred.getUrlForPairwise,
    isbSendCred: isbCred.isbCallback,
  };
};
