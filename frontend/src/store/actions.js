export const FETCH_USER = 'FETCH_USER';

export const fetchUser = (username) => ({
  type: FETCH_USER,
  payload: username,
});

export const FETCH_USER_FULFILLED = 'FETCH_USER_FULFILLED';

export const fetchUserFulfilled = (payload) => ({
  type: FETCH_USER_FULFILLED,
  payload,
});

export const FETCH_LEDGER = 'FETCH_LEDGER';

export const fetchLedger = (payload) => ({ type: FETCH_LEDGER, payload });

export const FETCH_LEDGER_FULFILLED = 'FETCH_LEDGER_FULFILLED';

export const fetchLedgerFulfilled = (payload) => ({
  type: FETCH_LEDGER_FULFILLED,
  payload,
});

export const FETCH_LEDGER_REJECTED = 'FETCH_LEDGER_REJECTED';

export const fetchLedgerRejected = (payload) => ({
  type: FETCH_LEDGER_REJECTED,
  payload,
});

export const FETCH_CONNECTIONS = 'FETCH_CONNECTIONS';

export const fetchConnections = (payload) => ({
  type: FETCH_CONNECTIONS,
  payload,
});

export const FETCH_CONNECTIONS_FULFILLED = 'FETCH_CONNECTIONS_FULFILLED';

export const fetchConnectionsFulfilled = (payload) => ({
  type: FETCH_CONNECTIONS_FULFILLED,
  payload,
});

export const FETCH_CONNECTIONS_REJECTED = 'FETCH_CONNECTIONS_REJECTED';

export const fetchConnectionsRejected = (payload) => ({
  type: FETCH_CONNECTIONS_REJECTED,
  payload,
});

export const FETCH_PAIRWISE_INVITATION = 'FETCH_PAIRWISE_INVITATION';

export const fetchPairwiseInvitation = (payload) => ({
  type: FETCH_PAIRWISE_INVITATION,
  payload,
});

export const FETCH_PAIRWISE_INVITATION_FULFILLED =
  'FETCH_PAIRWISE_INVITATION_FULFILLED';

export const fetchPairwiseInvitationFulfilled = (payload) => ({
  type: FETCH_PAIRWISE_INVITATION_FULFILLED,
  payload,
});

export const FETCH_PAIRWISE_INVITATION_REJECTED =
  'FETCH_PAIRWISE_INVITATION_REJECTED';

export const fetchPairwiseInvitationRejected = (payload) => ({
  type: FETCH_PAIRWISE_INVITATION_REJECTED,
  payload,
});

export const SET_TOKEN = 'SET_TOKEN';

export const setToken = (payload) => ({
  type: SET_TOKEN,
  payload,
});

export const SAVE_SCHEMA = 'SAVE_SCHEMA';

export const saveSchema = (payload) => ({
  type: SAVE_SCHEMA,
  payload,
});

export const SAVE_SCHEMA_FULFILLED = 'SAVE_SCHEMA_FULFILLED';

export const saveSchemaFulfilled = (payload) => ({
  type: SAVE_SCHEMA_FULFILLED,
  payload,
});

export const SAVE_SCHEMA_REJECTED = 'SAVE_SCHEMA_REJECTED';

export const saveSchemaRejected = (payload) => ({
  type: SAVE_SCHEMA_REJECTED,
  payload,
});

export const SAVE_CRED_DEF = 'SAVE_CRED_DEF';

export const saveCredDef = (payload) => ({
  type: SAVE_CRED_DEF,
  payload,
});

export const SAVE_CRED_DEF_FULFILLED = 'SAVE_CRED_DEF_FULFILLED';

export const saveCredDefFulfilled = (payload) => ({
  type: SAVE_CRED_DEF_FULFILLED,
  payload,
});

export const SAVE_CRED_DEF_REJECTED = 'SAVE_CRED_DEF_REJECTED';

export const saveCredDefRejected = (payload) => ({
  type: SAVE_CRED_DEF_REJECTED,
  payload,
});

export const FETCH_EVENTS_LOG = 'FETCH_EVENTS_LOG';

export const fetchEventsLog = (payload) => ({
  type: FETCH_EVENTS_LOG,
  payload,
});

export const FETCH_EVENTS_LOG_FULFILLED = 'FETCH_EVENTS_LOG_FULFILLED';

export const fetchEventsLogFulfilled = (payload) => ({
  type: FETCH_EVENTS_LOG_FULFILLED,
  payload,
});

export const FETCH_EVENTS_LOG_REJECTED = 'FETCH_EVENTS_LOG_REJECTED';

export const fetchEventsLogRejected = (payload) => ({
  type: FETCH_EVENTS_LOG_REJECTED,
  payload,
});

export const SEND_BASIC_MESSAGE = 'SEND_BASIC_MESSAGE';

export const sendBasicMessage = (payload) => ({
  type: SEND_BASIC_MESSAGE,
  payload,
});

export const SEND_BASIC_MESSAGE_FULFILLED = 'SEND_BASIC_MESSAGE_FULFILLED';

export const sendBasicMessageFulfilled = (payload) => ({
  type: SEND_BASIC_MESSAGE_FULFILLED,
  payload,
});

export const SEND_BASIC_MESSAGE_REJECTED = 'SEND_BASIC_MESSAGE_REJECTED';

export const sendBasicMessageRejected = (payload) => ({
  type: SEND_BASIC_MESSAGE_REJECTED,
  payload,
});

export const SEND_PROOF_REQUEST = 'SEND_PROOF_REQUEST';

export const sendProofRequest = (payload) => ({
  type: SEND_PROOF_REQUEST,
  payload,
});

export const SEND_PROOF_REQUEST_FULFILLED = 'SEND_PROOF_REQUEST_FULFILLED';

export const sendProofRequestFulfilled = (payload) => ({
  type: SEND_PROOF_REQUEST_FULFILLED,
  payload,
});

export const SEND_PROOF_REQUEST_REJECTED = 'SEND_PROOF_REQUEST_REJECTED';

export const sendProofRequestRejected = (payload) => ({
  type: SEND_PROOF_REQUEST_REJECTED,
  payload,
});

export const SEND_CREDENTIAL = 'SEND_CREDENTIAL';

export const sendCredential = (payload) => ({
  type: SEND_CREDENTIAL,
  payload,
});

export const SEND_CREDENTIAL_FULFILLED = 'SEND_CREDENTIAL_FULFILLED';

export const sendCredentialFulfilled = (payload) => ({
  type: SEND_CREDENTIAL_FULFILLED,
  payload,
});

export const SEND_CREDENTIAL_REJECTED = 'SEND_CREDENTIAL_REJECTED';

export const sendCredentialRejected = (payload) => ({
  type: SEND_CREDENTIAL_REJECTED,
  payload,
});

export const FETCH_CREDENTIAL_FULFILLED = 'FETCH_CREDENTIAL_FULFILLED';

export const fetchCredentialFulfilled = (payload) => ({
  type: FETCH_CREDENTIAL_FULFILLED,
  payload,
});

export const FETCH_CREDENTIAL_REJECTED = 'FETCH_CREDENTIAL_REJECTED';

export const fetchCredentialRejected = (payload) => ({
  type: SEND_CREDENTIAL_REJECTED,
  payload,
});

export const FETCH_URL = 'FETCH_URL';

export const fetchUrl = (payload) => ({
  type: FETCH_URL,
  payload,
});

export const FETCH_URL_FULFILLED = 'FETCH_URL_FULFILLED';

export const fetchUrlFulfilled = (payload) => ({
  type: FETCH_URL_FULFILLED,
  payload,
});

export const FETCH_URL_REJECTED = 'FETCH_URL_REJECTED';

export const fetchUrlRejected = (payload) => ({
  type: FETCH_URL_REJECTED,
  payload,
});

export const FETCH_CONFIG = 'FETCH_CONFIG';

export const fetchConfig = () => ({
  type: FETCH_CONFIG,
});

export const FETCH_CONFIG_FULFILLED = 'FETCH_CONFIG_FULFILLED';

export const fetchConfigFulfilled = (payload) => ({
  type: FETCH_CONFIG_FULFILLED,
  payload,
});
