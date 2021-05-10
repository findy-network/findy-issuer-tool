export default {
  user: null,
  ledger: null,
  token: localStorage.getItem('token'),
  result: {
    pairwiseInvitation: null,
    schemaId: null,
    credDefId: null,
  },
  events: {
    log: [],
  },
  connections: null,
  alert: null,
};
