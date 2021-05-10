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
      return { ...state, schemaId: null };
    }
    case SAVE_SCHEMA_FULFILLED: {
      return { ...state, schemaId: action.payload.id };
    }
    case SAVE_CRED_DEF: {
      return { ...state, credDefId: null };
    }
    case SAVE_CRED_DEF_FULFILLED: {
      return { ...state, credDefId: action.payload.id };
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
    ledger,
    connections,
    token,
    result,
    events,
    alert,
  });
