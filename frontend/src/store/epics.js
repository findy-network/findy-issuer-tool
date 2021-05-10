import { empty, of } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { map, mergeMap, switchMap, catchError, filter } from 'rxjs/operators';
import { combineEpics, ofType } from 'redux-observable';
import { LOCATION_CHANGE, replace } from 'connected-react-router';

import {
  FETCH_USER,
  fetchUser,
  fetchUserFulfilled,
  FETCH_LEDGER,
  fetchLedger,
  fetchLedgerFulfilled,
  fetchLedgerRejected,
  FETCH_CONNECTIONS,
  fetchConnections,
  fetchConnectionsFulfilled,
  fetchConnectionsRejected,
  setToken,
  SET_TOKEN,
  SAVE_SCHEMA,
  saveSchemaFulfilled,
  saveSchemaRejected,
  SAVE_CRED_DEF,
  saveCredDefFulfilled,
  saveCredDefRejected,
  FETCH_PAIRWISE_INVITATION,
  fetchPairwiseInvitationFulfilled,
  fetchPairwiseInvitationRejected,
  FETCH_EVENTS_LOG,
  fetchEventsLogFulfilled,
  fetchEventsLogRejected,
  SAVE_SCHEMA_FULFILLED,
  SAVE_CRED_DEF_FULFILLED,
  SEND_BASIC_MESSAGE,
  sendBasicMessageFulfilled,
  sendBasicMessageRejected,
  SEND_PROOF_REQUEST,
  sendProofRequestFulfilled,
  sendProofRequestRejected,
  SEND_CREDENTIAL,
  sendCredentialFulfilled,
  sendCredentialRejected,
} from './actions';

const post = (state$, path, payload) =>
  ajax({
    url: `${CONFIG.api.url}${path}`,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${state$.value.token}`,
      'Content-Type': 'application/json',
    },
    body: payload,
  });

const get = (state$, path) =>
  ajax({
    url: `${CONFIG.api.url}${path}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${state$.value.token}`,
    },
  });

const initUserFetchEpic = (action$, state$) =>
  action$.pipe(
    ofType(LOCATION_CHANGE),
    switchMap(() => {
      if (!state$.value.user) {
        const query = state$.value.router.location.search;
        if (query) {
          const params = new URLSearchParams(query);
          if (params) {
            const token = params.get('token');
            return of(setToken(token));
          }
        }
        return of(fetchUser());
      }
      return empty();
    })
  );

const initLedgerFetchEpic = (action$, state$) =>
  action$.pipe(
    ofType(LOCATION_CHANGE),
    filter(() => !state$.value.ledger),
    switchMap(() => of(fetchLedger()))
  );

const fetchLedgerEpic = (action$, state$) =>
  action$.pipe(
    ofType(FETCH_LEDGER, SAVE_SCHEMA_FULFILLED, SAVE_CRED_DEF_FULFILLED),
    mergeMap(() =>
      get(state$, '/ledger').pipe(
        map(({ response }) => fetchLedgerFulfilled(response)),
        catchError((error) => {
          return of(fetchLedgerRejected(error.xhr.response));
        })
      )
    )
  );

const initConnectionsFetchEpic = (action$, state$) =>
  action$.pipe(
    ofType(LOCATION_CHANGE),
    filter(
      () =>
        !state$.value.connections ||
        ['/message', '/issue', '/verify'].find((item) =>
          state$.value.router.location.pathname.includes(item)
        )
    ),
    switchMap(() => of(fetchConnections()))
  );

const fetchConnectionsEpic = (action$, state$) =>
  action$.pipe(
    ofType(FETCH_CONNECTIONS),
    mergeMap(() =>
      get(state$, '/connections').pipe(
        map(({ response }) => fetchConnectionsFulfilled(response)),
        catchError((error) => {
          return of(fetchConnectionsRejected(error.xhr.response));
        })
      )
    )
  );

const useTokenEpic = (action$) =>
  action$.pipe(
    ofType(SET_TOKEN),
    switchMap((action) => {
      localStorage.setItem('token', action.payload);
      return of(replace('/'));
    })
  );

const fetchUserEpic = (action$, state$) =>
  action$.pipe(
    ofType(FETCH_USER),
    mergeMap(() =>
      get(state$, '/user').pipe(
        map(({ response }) => fetchUserFulfilled(response)),
        catchError(() => {
          // TODO: do we need to: push('/');
          return of(fetchUserFulfilled({}));
        })
      )
    )
  );

const createEpic = (
  actionType,
  httpVerb,
  path,
  reqPayload,
  fulfilled,
  rejected
) => (action$, state$) =>
  action$.pipe(
    ofType(actionType),
    mergeMap(({ payload }) =>
      httpVerb(state$, path(payload), reqPayload(payload)).pipe(
        map(({ response }) => fulfilled(response)),
        catchError((error) => {
          return of(rejected(error.xhr.response));
        })
      )
    )
  );

export default combineEpics(
  initUserFetchEpic,
  initLedgerFetchEpic,
  fetchLedgerEpic,
  initConnectionsFetchEpic,
  fetchConnectionsEpic,
  useTokenEpic,
  fetchUserEpic,
  createEpic(
    FETCH_PAIRWISE_INVITATION,
    post,
    () => '/pairwise/invitation',
    () => {},
    fetchPairwiseInvitationFulfilled,
    fetchPairwiseInvitationRejected
  ),
  createEpic(
    SAVE_SCHEMA,
    post,
    () => '/create/schema',
    (payload) => payload,
    saveSchemaFulfilled,
    saveSchemaRejected
  ),
  createEpic(
    SAVE_CRED_DEF,
    post,
    () => '/create/cred-def',
    (payload) => payload,
    saveCredDefFulfilled,
    saveCredDefRejected
  ),
  createEpic(
    FETCH_EVENTS_LOG,
    get,
    () => `/events/log`,
    () => {},
    fetchEventsLogFulfilled,
    fetchEventsLogRejected
  ),
  createEpic(
    SEND_BASIC_MESSAGE,
    post,
    () => '/pairwise/basic-message',
    (payload) => payload,
    sendBasicMessageFulfilled,
    sendBasicMessageRejected
  ),
  createEpic(
    SEND_PROOF_REQUEST,
    post,
    () => '/pairwise/proof-request',
    (payload) => payload,
    sendProofRequestFulfilled,
    sendProofRequestRejected
  ),
  createEpic(
    SEND_CREDENTIAL,
    post,
    () => '/pairwise/credential',
    (payload) => payload,
    sendCredentialFulfilled,
    sendCredentialRejected
  )
);
