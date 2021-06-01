import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';

import alert from './alert';

import {
  FETCH_USER_FULFILLED,
  SET_TOKEN,
  SAVE_SCHEMA_FULFILLED,
  SAVE_CRED_DEF_FULFILLED,
  SAVE_SCHEMA,
  SAVE_CRED_DEF,
  FETCH_PAIRWISE_INVITATION_FULFILLED,
  FETCH_EVENTS_LOG_FULFILLED,
  FETCH_LEDGER_FULFILLED,
  FETCH_CONNECTIONS_FULFILLED,
  SAVE_SCHEMA_REJECTED,
  SAVE_CRED_DEF_REJECTED,
  SEND_BASIC_MESSAGE_FULFILLED,
  SEND_BASIC_MESSAGE,
  SEND_BASIC_MESSAGE_REJECTED,
  SEND_CREDENTIAL,
  SEND_CREDENTIAL_FULFILLED,
  SEND_CREDENTIAL_REJECTED,
  SEND_PROOF_REQUEST,
  SEND_PROOF_REQUEST_FULFILLED,
  SEND_PROOF_REQUEST_REJECTED,
  FETCH_CONFIG_FULFILLED,
  FETCH_URL_FULFILLED,
} from '../actions';
import initialState from './initial-state';

export const user = (state = initialState.user, action) => {
  switch (action.type) {
    case SET_TOKEN:
      return null;
    case FETCH_USER_FULFILLED:
      return action.payload;
    default:
      return state;
  }
};

export const config = (state = initialState.config, action) => {
  switch (action.type) {
    case FETCH_CONFIG_FULFILLED:
      return action.payload;
    default:
      return state;
  }
};

export const ledger = (state = initialState.ledger, action) => {
  switch (action.type) {
    case FETCH_LEDGER_FULFILLED:
      return action.payload;
    default:
      return state;
  }
};

export const connections = (state = initialState.connections, action) => {
  switch (action.type) {
    case FETCH_CONNECTIONS_FULFILLED:
      return action.payload;
    default:
      return state;
  }
};

export const token = (state = initialState.token, action) => {
  switch (action.type) {
    case SET_TOKEN:
      return action.payload;
    default:
      return state;
  }
};

export const result = (state = initialState.result, action) => {
  switch (action.type) {
    case FETCH_PAIRWISE_INVITATION_FULFILLED: {
      return { ...state, pairwiseInvitation: action.payload };
    }
    case SAVE_SCHEMA: {
      return { ...state, schemaId: null, sendingSchema: true };
    }
    case SAVE_SCHEMA_FULFILLED: {
      return { ...state, schemaId: action.payload.id, sendingSchema: false };
    }
    case SAVE_CRED_DEF: {
      return { ...state, credDefId: null, sendingCredDef: true };
    }
    case SAVE_CRED_DEF_FULFILLED: {
      return { ...state, credDefId: action.payload.id, sendingCredDef: false };
    }
    case SAVE_SCHEMA_REJECTED: {
      return { ...state, sendingSchema: false };
    }
    case SAVE_CRED_DEF_REJECTED: {
      return { ...state, sendingCredDef: false };
    }

    case SEND_BASIC_MESSAGE: {
      return { ...state, sendingBasicMessage: true };
    }
    case SEND_BASIC_MESSAGE_FULFILLED: {
      return { ...state, sendingBasicMessage: false };
    }
    case SEND_BASIC_MESSAGE_REJECTED: {
      return { ...state, sendingBasicMessage: false };
    }

    case SEND_CREDENTIAL: {
      return { ...state, sendingCredential: true };
    }
    case SEND_CREDENTIAL_FULFILLED: {
      return { ...state, sendingCredential: false };
    }
    case SEND_CREDENTIAL_REJECTED: {
      return { ...state, sendingCredential: false };
    }

    case SEND_PROOF_REQUEST: {
      return { ...state, sendingProofRequest: true };
    }
    case SEND_PROOF_REQUEST_FULFILLED: {
      return { ...state, sendingProofRequest: false };
    }
    case SEND_PROOF_REQUEST_REJECTED: {
      return { ...state, sendingProofRequest: false };
    }

    case FETCH_URL_FULFILLED: {
      return {
        ...state,
        url: { ...state.url, [action.payload.path]: action.payload.url },
      };
    }

    default:
      return state;
  }
};

export const events = (state = initialState.events, action) => {
  switch (action.type) {
    case FETCH_EVENTS_LOG_FULFILLED: {
      return { ...state, log: action.payload };
    }
    default:
      return state;
  }
};

export default (history) =>
  combineReducers({
    router: connectRouter(history),
    user,
    config,
    ledger,
    connections,
    token,
    result,
    events,
    alert,
  });
