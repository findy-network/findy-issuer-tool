# findy-issuer-tool

Utility (UI) tool and sample project for issuing and verifying

## Development

1. Start backend server

   1. TODO: instructions for .npmrc + GITHUB_TOKEN or remove when public
   1. Declare agency configuration using environment variables or configuration file (check ./config/default.json). Use either local or cloud installation of Findy Agency.

      Following settings are mandatory for successful agency connection:

      ```bash
      export ISSUER_TOOL_AGENCY_AUTH_URL=<agency auth service URL>
      export ISSUER_TOOL_AGENCY_USER_NAME=<unique agent name>
      export ISSUER_TOOL_AGENCY_KEY=<authenticator key>
      export ISSUER_TOOL_SERVER_ADDRESS=<agency core service address>
      ```

   1. Run server: `npm run start:api`

1. Start frontend server
   1. Open new terminal
   1. Run: `npm run start:frontend`
      Configuration
