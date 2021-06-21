# findy-issuer-tool

Utility (UI) Node.js tool and sample project for issuing and verifying with Findy agency.

## Development

1. This app utilises Findy agency for issuing and verifying credentials. You can either connect to a cloud installation of Findy agency or [launch agency locally](https://github.com/findy-network/findy-wallet-pwa/blob/master/tools/env/README.md).

1. Start backend server

   1. [Setup](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#authenticating-with-a-personal-access-token) GitHub package registry authentication

   1. Install dependencies

      ```sh
      cd api
      echo "@findy-network:registry=https://npm.pkg.github.com" >> .npmrc
      npm install
      ```

   1. Declare agency configuration using environment variables or configuration file (check ./config/default.json).

      Following settings are mandatory for successful agency connection:

      ```sh
      export ISSUER_TOOL_AGENCY_AUTH_URL=<agency auth service URL>
      export ISSUER_TOOL_AGENCY_USER_NAME=<unique agent name>
      export ISSUER_TOOL_AGENCY_KEY=<authenticator key>
      export ISSUER_TOOL_SERVER_ADDRESS=<agency core service address>
      ```

      Example for local environment:

      ```sh
      export ISSUER_TOOL_AGENCY_AUTH_URL="http://localhost:8088"
      export ISSUER_TOOL_AGENCY_AUTH_ORIGIN="http://localhost:3000"
      export ISSUER_TOOL_AGENCY_USER_NAME="my-issuer-tool"
      export ISSUER_TOOL_AGENCY_KEY="15308490f1e4026284594dd08d31291bc8ef2aeac730d0daf6ff87bb92d4336c"
      export ISSUER_TOOL_SERVER_ADDRESS="localhost"
      export ISSUER_TOOL_SERVER_PORT="50052"
      export ISSUER_TOOL_SERVER_CERT_PATH="../tools/local-cert"
      ```

      Note:

      - the key value is your agency authenticator master key and should be kept secret in production environment.
      - the auth origin is usually needed only in development setup where wallet app and authentication service resides in different domains

   1. Start database service in local container: `npm run db`

   1. Run server: `npm start`

1. Start frontend server

   1. Open new terminal

   1. Run
      ```sh
      cd frontend
      npm install
      npm start
      ```
