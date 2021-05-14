import {
  SET_TOKEN,
  SAVE_SCHEMA_REJECTED,
  SAVE_CRED_DEF_REJECTED,
  SAVE_SCHEMA,
  SAVE_CRED_DEF,
  FETCH_PAIRWISE_INVITATION_REJECTED,
  SEND_BASIC_MESSAGE_REJECTED,
  SEND_CREDENTIAL_FULFILLED,
  SEND_CREDENTIAL_REJECTED,
  FETCH_USER,
  FETCH_LEDGER,
  FETCH_CONNECTIONS,
  FETCH_PAIRWISE_INVITATION,
  FETCH_EVENTS_LOG,
  SEND_BASIC_MESSAGE,
  SEND_BASIC_MESSAGE_FULFILLED,
  SEND_PROOF_REQUEST,
  SEND_CREDENTIAL,
} from '../actions';

import initialState from './initial-state';

export default (state = initialState.alert, action) => {
  switch (action.type) {
    case SEND_CREDENTIAL_FULFILLED:
      return {
        description: 'Credential sent successfully',
        severity: 'success',
      };
    case SEND_BASIC_MESSAGE_FULFILLED:
      return {
        description: 'Message sent successfully',
        severity: 'success',
      };
    case SEND_CREDENTIAL_REJECTED:
      return {
        description: 'Failed to send credential offer.',
        reason: action.payload,
        severity: 'error',
      };
    case FETCH_PAIRWISE_INVITATION_REJECTED:
      return {
        description: 'Failed to fetch pairwise offer.',
        reason: action.payload,
        severity: 'error',
      };
    case SAVE_SCHEMA_REJECTED:
      return {
        description: 'Failed to save schema.',
        reason: action.payload,
        severity: 'error',
      };
    case SAVE_CRED_DEF_REJECTED:
      return {
        description: 'Failed to save credential definition.',
        reason: action.payload,
        severity: 'error',
      };
    case SEND_BASIC_MESSAGE_REJECTED: {
      return {
        description: 'Failed to send basic message.',
        reason: action.payload,
        severity: 'error',
      };
    }
    case FETCH_USER:
    case FETCH_LEDGER:
    case FETCH_CONNECTIONS:
    case SET_TOKEN:
    case SAVE_SCHEMA:
    case SAVE_CRED_DEF:
    case FETCH_PAIRWISE_INVITATION:
    case FETCH_EVENTS_LOG:
    case SEND_BASIC_MESSAGE:
    case SEND_PROOF_REQUEST:
    case SEND_CREDENTIAL:
      return null;

    default:
      return state;
  }
};
