import axios from 'axios';
import config from 'config';
import log from '../../log';

export default (createToken) => {
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
      const token = await createToken(userResponse.data.name, primaryEmail);
      return res.redirect(`${redirectUrl}?token=${token}`);
    }
    return res.redirect(`${redirectUrl}`);
  };

  const githubLoginIssuer = (req, res) => {
    const app = config.auth.apps['findy-issuer-app'];
    return githubLogin(app.github, app.redirectUrl, req, res);
  };

  return { githubLoginIssuer };
};
