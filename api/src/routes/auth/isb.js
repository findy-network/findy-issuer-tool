import axios from 'axios';
import fs from 'fs';
import jose from 'node-jose';
import { Issuer, generators } from 'openid-client';
import { v4 as uuidv4 } from 'uuid';

import log from '../../log';

// Sample implementation for credential generation from OIDC based authentication
// Note: this is a PoC, not production ready
// implementation is missing security considerations like error handling
export default async (
  addOrUpdateUser,
  config,
  finalStep = (res, ok) =>
    res.redirect(
      `${config.auth.apps['findy-issuer-app'].redirectUrl}/me?cred_ready=${ok}`,
    ),
) => {
  const { clientId } = config.auth.apps['findy-issuer-app'].isb;
  const isbHost = config.auth.apps['findy-issuer-app'].isb.host;
  const urlGenPath = '/creds/isb-url';
  const signAlg = 'RS256';
  const { ourHost } = config;

  const issuer = await Issuer.discover(isbHost);
  log.info(
    `Discovered ISB ${issuer.issuer} docs: ${issuer.metadata.service_documentation}`,
  );

  const keys = {
    encyptionKey: fs
      .readFileSync('./tools/isb/sandbox-sp-encryption-key.pem')
      .toString(),
    signingKey: fs.readFileSync('./tools/isb/sp-signing-key.pem').toString(),
  };

  const getIsbSigningKey = async () => {
    const response = await axios.get(`${isbHost}jwks/broker`);
    return jose.JWK.asKeyStore(response.data);
  };

  const makeClientAssertion = async () => {
    const payload = {
      iss: clientId,
      sub: clientId,
      aud: `${isbHost}/oauth/token`,
      jti: uuidv4().toString(),
      exp: Math.floor(Date.now() / 1000) + 10 * 60,
    };
    const payloadJSON = JSON.stringify(payload);
    const signingKey = await jose.JWK.asKey(keys.signingKey, 'pem');
    return jose.JWS.createSign({ format: 'compact' }, signingKey).final(
      payloadJSON,
      'utf-8',
    );
  };

  const decryptToken = async (token) => {
    const privKey = await jose.JWK.asKey(keys.encyptionKey, 'pem');
    const decrypted = (
      await jose.JWE.createDecrypt(privKey).decrypt(token)
    ).plaintext.toString();
    const isbSigningKey = await getIsbSigningKey(); // TODO: cache for 1 hour
    log.info(
      `Decrypting token with isb signing key ${JSON.stringify(isbSigningKey)}`,
    );
    const verificationResult = await jose.JWS.createVerify(
      isbSigningKey,
    ).verify(decrypted);
    return JSON.parse(verificationResult.payload.toString());
  };

  const keyStore = jose.JWK.createKeyStore();
  await keyStore.add(keys.signingKey, 'pem', { use: 'sig' });
  await keyStore.add(keys.encyptionKey, 'pem', { use: 'enc' });

  const newNonce = () => generators.nonce();

  const isbCallback = async (req, res) => {
    const payload = {
      client_id: clientId,
      grant_type: 'authorization_code',
      code: req.query.code,
      redirect_uri: `${ourHost}/auth/isb`,
      client_assertion_type:
        'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
      client_assertion: await makeClientAssertion(),
    };
    const params = Object.keys(payload).reduce((result, item) => {
      result.append(item, payload[item]);
      return result;
    }, new URLSearchParams());

    const url = `${isbHost}oauth/token`;
    const conf = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };

    const tokenResponse = await axios.post(url, params, conf);
    log.info(`Token response received ${JSON.stringify(tokenResponse.data)}`);

    const profile = await decryptToken(tokenResponse.data.id_token);
    const nonceValid = profile.nonce === req.session.nonce;
    if (nonceValid) {
      const { email } = req.session;
      const values = {
        name: profile.name,
        given_name: profile.given_name,
        family_name: profile.family_name,
        birthdate: profile.birthdate,
        personal_identity_code: profile.personal_identity_code,
        auth_time: profile.auth_time.toString(),
      };
      log.info(
        `Saving ISB credential to user ${email}: ${JSON.stringify(values)}`,
      );

      await addOrUpdateUser({ email, creds: [{ id: 'ftn', values }] });

      req.session.nonce = null;
      req.session.email = null;
    } else {
      log.warn(`Nonce mismatch ${profile.nonce}, ${req.session.nonce}`);
    }
    return finalStep(res, nonceValid);
  };

  const getUrl = () => urlGenPath;

  const getUrlForEmail = async (nonce, redirectUri = `${ourHost}/auth/isb`) => {
    const content = {
      client_id: clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      nonce,
      scope: 'openid profile personal_identity_code',
    };
    const client = new issuer.Client(
      {
        ...content,
        token_endpoint_auth_method: 'private_key_jwt',
        token_endpoint_auth_signing_alg: signAlg,
        request_object_signing_alg: signAlg,
      },
      keyStore.toJSON(true),
    );

    const request = await client.requestObject(content);
    return client.authorizationUrl({
      request,
    });
  };

  const getUrlForEmailForRequest = async (req, res) => {
    const nonce = newNonce();
    req.session.nonce = nonce;
    req.session.email = req.user.email;
    log.info(`Generating ISB auth url to user ${req.user.email}`);

    return res.json({
      path: urlGenPath,
      url: await getUrlForEmail(nonce),
    });
  };

  return {
    isbCallback,
    getUrl,
    getUrlForEmail,
    getUrlForEmailForRequest,
    newNonce,
  };
};
