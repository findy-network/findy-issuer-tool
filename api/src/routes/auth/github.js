import axios from 'axios';
import log from '../../log';

export default (createToken, config) => {
  const githubLogin = async (ghAuth, redirectUrl, { query: { code } }, res) => {
    log.info(`Received github auth callback with code ${code}`);

    const payload = {
      client_id: ghAuth.clientId,
      client_secret: ghAuth.clientSecret,
      code,
    };
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
    );

    const accessToken = tokenResponse.data.access_token;
    log.info(`Received github access token ${accessToken}`);
    const userResponse = await axios.get(
      `https://${ghAuth.username}:${accessToken}@api.github.com/user`,
    );

    const name = userResponse.data.name || userResponse.data.login;

    const userEmailsResponse = await axios.get(
      `https://${ghAuth.username}:${accessToken}@api.github.com/user/emails`,
    );

    // TODO: handle errors
    const primaryEmail = userEmailsResponse.data.find(
      (item) => item.primary,
    ).email;
    const index = primaryEmail.indexOf('@');
    if (
      index > -1 &&
      config.auth.allowedDomains.includes(primaryEmail.substring(index + 1))
    ) {
      const token = await createToken(name, primaryEmail, userResponse.data.id);
      return res.redirect(`${redirectUrl}?token=${token}`);
    }
    return res.redirect(`${redirectUrl}`);
  };

  const appConfig = config.auth.apps['findy-issuer-app'];

  const githubLoginIssuer = (req, res) => {
    return githubLogin(appConfig.github, appConfig.redirectUrl, req, res);
  };

  const getUrl = () =>
    `https://github.com/login/oauth/authorize?scope=user:email&amp;client_id=${appConfig.github.clientId}`;

  return { githubLoginIssuer, getUrl };
};
