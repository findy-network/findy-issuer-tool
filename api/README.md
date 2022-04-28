# Issuer tool API

Simple service agent sample for Findy agency

## GitHub authentication

1. [Register GitHub OAuth app](https://github.com/settings/applications/new) to gain Github client ID and secret. Enter following details:

   - Application name: any name e.g. `findy-issuer-app`
   - Application URL: any url e.g. `https://github.com/findy-network`
   - Authorization callback URL: `http://localhost:3001/auth/callback/findy-issuer-app`

   Define following environment variables.

   ```
   export ISSUER_TOOL_GITHUB_USERNAME=<your_gh_username>
   export ISSUER_TOOL_GITHUB_CLIENT_ID=<client_id_from_gh_app>
   export ISSUER_TOOL_GITHUB_CLIENT_SECRET=<client_secret_from_gh_app>
   ```

## FTN credential flow

```mermaid
sequenceDiagram
    autonumber
    participant AgentUser
    participant User
    participant FTNService
    participant AuthService
    participant AgentService

    User->>FTNService: Navigate to service
    FTNService->>AgentFTN: New invitation
    AgentFTN-->>FTNService: <<invitation>>
    Note left of FTNService: Render invitation QR code
    User->>AgentUser: Use wallet to read QR code
    AgentUser->>FTNService: Read invitation
    AgentUser->>AgentFTN: New pairwise connection
    AgentFTN->>FTNService: Pairwise created!
    FTNService->>AgentFTN: Send authentication instructions
    AgentFTN->>AgentUser: Basic message via DIDComm
    AgentUser->>User: Show instructions with authentication link
    rect rgb(248, 248, 248)
    Note right of User: OIDC protocol for user authentication
    User->>AuthService: Authenticate with bank credentials
    AuthService-->>FTNService: Redirect to FTN service
    FTNService->>AuthService: Fetch user data
    FTNService-->>User: Redirect to wallet
    end
    FTNService->>AgentFTN: Send credential offer
    AgentFTN->>AgentUser: Issue credential via DIDComm
    AgentUser->>User: Receive credential?
    User-->>AgentUser: Ok!

```
