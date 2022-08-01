export default {
  config: null,
  user: null,
  ledger: null,
  token: localStorage.getItem('token'),
  result: {
    pairwiseInvitation: null,
    schemaId: null,
    credDefId: null,
    sendingSchema: false,
    sendingCredDef: false,
    sendingBasicMessage: false,
    sendingCredential: false,
    sendingProofRequest: false,
    url: {},
  },
  events: {
    log: [],
  },
  connections: null,
  alert: null,
  ftn: {
    invitation: null,
    status: null,
    url: null,
  },
};
