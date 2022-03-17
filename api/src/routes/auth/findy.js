import { Issuer, generators } from 'openid-client';

import log from '../../log';

export default async (createToken, config) => {
  const { clientId, clientSecret } = config.auth.apps['findy-issuer-app'].findy;
  const findyOIDCHost = config.auth.apps['findy-issuer-app'].findy.host;
  const { ourHost } = config;

  const issuer = await Issuer.discover(findyOIDCHost);
  log.info(
    `Discovered findy OIDC ${issuer.issuer} docs: ${issuer.metadata.service_documentation}`,
  );

  const content = {
    client_id: clientId,
    client_secret: clientSecret,
    response_type: 'code',
    redirect_uri: `${ourHost}/auth/findy`,
  };
  const client = new issuer.Client(content);

  const findyOIDCCallback = async (req, res) => {
    const {
      query: { error, error_description: errorDesc },
    } = req;
    if (error) {
      log.error(`${error}: ${errorDesc}`);
    }
    const tokenSet = await client.callback(
      content.redirect_uri,
      client.callbackParams(req),
      {
        code_verifier: req.session.codeVerifier,
      },
    );
    const { redirectUrl } = config.auth.apps['findy-issuer-app'];
    const info = await client.userinfo(tokenSet);
    if (info.email && info.name) {
      const token = await createToken(info.name, info.email, info.sub);
      return res.redirect(`${redirectUrl}?token=${token}`);
    }
    log.error(`No email or name in userinfo: ${JSON.stringify(info)}`);
    return res.redirect(`${redirectUrl}?error=true`);
  };

  const getUrl = (req) => {
    const codeVerifier = generators.codeVerifier();
    req.session.codeVerifier = codeVerifier;
    return client.authorizationUrl({
      code_challenge: generators.codeChallenge(codeVerifier),
      code_challenge_method: 'S256',
      scope: 'openid profile email',
    });
  };

  return { findyOIDCCallback, getUrl };
};
