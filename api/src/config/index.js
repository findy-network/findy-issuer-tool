import defaultConfig from 'config';
import AWS from 'aws-sdk';
import { writeFileSync } from 'fs';
import log from '../log';

export default async () => {
  const loadConfig = async () => {
    const configFromAWS = {};
    if (!defaultConfig.devMode) {
      try {
        const client = new AWS.SecretsManager({
          region: defaultConfig.storage.region, // TODO: refactor
        });
        const res = await client
          .getSecretValue({ SecretId: 'issuer-tool' })
          .promise();
        const secrets = JSON.parse(res.SecretString);
        configFromAWS.storage = {
          host: secrets['storage-host'],
          region: secrets['storage-region'],
        };
        configFromAWS.auth = {
          jwtSharedSecret: secrets['jwt-shared-secret'],
          apps: {
            'findy-issuer-app': {
              github: {
                username: secrets['github-username'],
                clientId: secrets['github-client-id'],
                clientSecret: secrets['github-client-secret'],
              },
              redirectUrl: secrets['redirect-url'],
            },
          },
          allowedDomains: secrets['auth-allowed-domains'],
        };
        configFromAWS.agency = {
          ...defaultConfig.agency,
          authUrl: secrets['agency-auth-url'],
          userName: secrets['agency-user-name'],
          key: secrets['agency-key'],
          serverAddress: secrets['server-address'],
        };

        log.info(`Default config cert path ${defaultConfig.agency.certPath}`);
        const certPath = await (async () => {
          if (defaultConfig.agency.certPath.startsWith('s3://')) {
            const s3Client = new AWS.S3();
            const fileName = 'server.crt';
            const path = `./${fileName}`;
            const data = await s3Client
              .getObject({
                Bucket: defaultConfig.agency.certPath.replace('s3://', ''),
                Key: fileName,
              })
              .promise();
            writeFileSync(path, data.Body.toString());
            return path;
          }
          return defaultConfig.agency.certPath;
        })();
        configFromAWS.agency.certPath = certPath;

        log.info(`Using cert path ${configFromAWS.agency.certPath}`);
        return {
          ...defaultConfig,
          storage: { ...defaultConfig.storage, ...configFromAWS.storage },
          auth: {
            ...defaultConfig.auth,
            ...configFromAWS.auth,
            apps: {
              'findy-issuer-app': {
                ...defaultConfig.auth.apps['findy-issuer-app'],
                ...configFromAWS.auth.apps['findy-issuer-app'],
              },
            },
          },
          agency: { ...defaultConfig.agency, ...configFromAWS.agency },
        };
      } catch (err) {
        log.error(err);
      }
    }

    return defaultConfig;
  };

  const config = await loadConfig();

  const validate = async () => {
    if (!config.auth.jwtSharedSecret) {
      log.error(`JWT secret missing`);
      process.exit(1);
    }
    if (!config.agency.authUrl) {
      log.error(`Authentication server URL missing`);
      process.exit(1);
    }
    if (!config.agency.userName) {
      log.error(`Unique agent name missing`);
      process.exit(1);
    }
    if (!config.agency.key) {
      log.error(`Authenticator key missing`);
      process.exit(1);
    }
    if (!config.agency.serverAddress) {
      log.error(`API server address missing`);
      process.exit(1);
    }
    if (!config.agency.serverPort) {
      log.error(`API server port missing`);
      process.exit(1);
    }
  };
  return {
    validate,
    config,
  };
};
