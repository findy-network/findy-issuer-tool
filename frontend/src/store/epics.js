import { of } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import {
  map,
  mergeMap,
  switchMap,
  catchError,
  filter,
  delay,
} from 'rxjs/operators';
import { combineEpics, ofType } from 'redux-observable';

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
  fetchConfig,
  FETCH_CONFIG,
  fetchConfigFulfilled,
  FETCH_URL,
  fetchUrlFulfilled,
  fetchUrlRejected,
  fetchCredentialFulfilled,
  fetchCredentialRejected,
  FETCH_FTN_INVITATION,
  fetchFtnInvitationFulfilled,
  fetchFtnInvitationRejected,
  FETCH_FTN_STATUS,
  fetchFtnStatusFulfilled,
  fetchFtnStatusRejected,
  fetchFtnStatus,
  INIT_APP,
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
    withCredentials: true,
  });

const get = (state$, path) =>
  ajax({
    url: `${CONFIG.api.url}${path}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${state$.value.token}`,
    },
    withCredentials: true,
  });

const initUserFetchEpic = (action$) =>
  action$.pipe(
    ofType(INIT_APP),
    switchMap(() => {
      const query = new URLSearchParams(window.location.search);
      if (query) {
        const token = query.get('token');
        if (token) {
          localStorage.setItem('token', token);
          window.location.assign('/');
        }
      }
      return of(fetchUser());
    }),
  );

const initConfigFetchEpic = (action$, state$) =>
  action$.pipe(
    ofType(INIT_APP),
    filter(() => !state$.value.config),
    switchMap(() => of(fetchConfig())),
  );

const initLedgerFetchEpic = (action$, state$) =>
  action$.pipe(
    ofType(INIT_APP),
    filter(() => !state$.value.ledger),
    switchMap(() => of(fetchLedger())),
  );

const initAlertEpic = (action$) =>
  action$.pipe(
    ofType(INIT_APP),
    filter(() => {
      const query = new URLSearchParams(window.location.search);
      if (query) {
        return query && query.get('cred_ready');
      }
      return false;
    }),
    switchMap(() => {
      const sent = new URLSearchParams(window.location.search).get(
        'cred_ready',
      );
      return sent === 'true'
        ? of(fetchCredentialFulfilled())
        : of(fetchCredentialRejected());
    }),
  );

const initFtnEpic = (action$) =>
  action$.pipe(
    ofType(INIT_APP),
    filter(() => {
      const query = new URLSearchParams(window.location.search);
      if (window.location.pathname.startsWith('/login-credential') && query) {
        return query && query.get('ftn_cred_ready');
      }
      return false;
    }),
    switchMap(() => {
      const sent = new URLSearchParams(window.location.search).get(
        'ftn_cred_ready',
      );
      return sent === 'true'
        ? of(fetchFtnStatusFulfilled({ status: 'done_ok' }))
        : of(fetchFtnStatusFulfilled({ status: 'done_fail' }));
    }),
  );

const fetchLedgerEpic = (action$, state$) =>
  action$.pipe(
    ofType(FETCH_LEDGER, SAVE_SCHEMA_FULFILLED, SAVE_CRED_DEF_FULFILLED),
    mergeMap(() =>
      get(state$, '/ledger').pipe(
        map(({ response }) => fetchLedgerFulfilled(response)),
        catchError((error) => of(fetchLedgerRejected(error.xhr.response))),
      ),
    ),
  );

const initConnectionsFetchEpic = (action$, state$) =>
  action$.pipe(
    ofType(INIT_APP),
    filter(
      () =>
        !state$.value.connections ||
        ['/message', '/issue', '/verify'].find((item) =>
          state$.value.router.location.pathname.includes(item),
        ),
    ),
    switchMap(() => of(fetchConnections())),
  );

const fetchConnectionsEpic = (action$, state$) =>
  action$.pipe(
    ofType(FETCH_CONNECTIONS),
    mergeMap(() =>
      get(state$, '/connections').pipe(
        map(({ response }) => fetchConnectionsFulfilled(response)),
        catchError((error) => of(fetchConnectionsRejected(error.xhr.response))),
      ),
    ),
  );

const fetchUserEpic = (action$, state$) =>
  action$.pipe(
    ofType(FETCH_USER),
    mergeMap(() =>
      get(state$, '/user').pipe(
        map(({ response }) => fetchUserFulfilled(response)),
        catchError(() =>
          // TODO: do we need to: push('/');
          of(fetchUserFulfilled({})),
        ),
      ),
    ),
  );

const fetchConfigEpic = (action$, state$) =>
  action$.pipe(
    ofType(FETCH_CONFIG),
    mergeMap(() =>
      get(state$, '/auth/config').pipe(
        map(({ response }) => fetchConfigFulfilled(response)),
      ),
    ),
  );

const createEpic =
  (actionType, httpVerb, path, reqPayload, fulfilled, rejected) =>
  (action$, state$) =>
    action$.pipe(
      ofType(actionType),
      mergeMap(({ payload }) =>
        httpVerb(state$, path(payload), reqPayload(payload)).pipe(
          map(({ response }) => fulfilled(response)),
          catchError((error) => of(rejected(error.xhr.response))),
        ),
      ),
    );

const fetchFtnStatusEpic = (action$, state$) =>
  action$.pipe(
    ofType(FETCH_FTN_STATUS),
    delay(3000),
    mergeMap(({ payload }) =>
      get(state$, `/ftn/status?id=${payload.id}`).pipe(
        map(({ response }) =>
          response.status.startsWith('ready')
            ? fetchFtnStatusFulfilled(response)
            : fetchFtnStatus({ id: payload.id, status: response.status }),
        ),
        catchError((error) => of(fetchFtnStatusRejected(error.xhr.response))),
      ),
    ),
  );

export default combineEpics(
  initUserFetchEpic,
  initConfigFetchEpic,
  initLedgerFetchEpic,
  fetchLedgerEpic,
  initConnectionsFetchEpic,
  initAlertEpic,
  fetchConnectionsEpic,
  fetchUserEpic,
  fetchConfigEpic,
  createEpic(
    FETCH_PAIRWISE_INVITATION,
    post,
    () => '/pairwise/invitation',
    () => {},
    fetchPairwiseInvitationFulfilled,
    fetchPairwiseInvitationRejected,
  ),
  createEpic(
    SAVE_SCHEMA,
    post,
    () => '/create/schema',
    (payload) => payload,
    saveSchemaFulfilled,
    saveSchemaRejected,
  ),
  createEpic(
    SAVE_CRED_DEF,
    post,
    () => '/create/cred-def',
    (payload) => payload,
    saveCredDefFulfilled,
    saveCredDefRejected,
  ),
  createEpic(
    FETCH_EVENTS_LOG,
    get,
    () => `/events/log`,
    () => {},
    fetchEventsLogFulfilled,
    fetchEventsLogRejected,
  ),
  createEpic(
    SEND_BASIC_MESSAGE,
    post,
    () => '/pairwise/basic-message',
    (payload) => payload,
    sendBasicMessageFulfilled,
    sendBasicMessageRejected,
  ),
  createEpic(
    SEND_PROOF_REQUEST,
    post,
    () => '/pairwise/proof-request',
    (payload) => payload,
    sendProofRequestFulfilled,
    sendProofRequestRejected,
  ),
  createEpic(
    SEND_CREDENTIAL,
    post,
    () => '/pairwise/credential',
    (payload) => payload,
    sendCredentialFulfilled,
    sendCredentialRejected,
  ),
  createEpic(
    FETCH_URL,
    get,
    ({ url, connectionId, credDefId }) =>
      `${url}?connectionId=${connectionId}&credDefId=${credDefId}`,
    () => {},
    fetchUrlFulfilled,
    fetchUrlRejected,
  ),
  createEpic(
    FETCH_FTN_INVITATION,
    get,
    () => `/ftn/start`,
    () => {},
    fetchFtnInvitationFulfilled,
    fetchFtnInvitationRejected,
  ),
  fetchFtnStatusEpic,
  initFtnEpic,
);
