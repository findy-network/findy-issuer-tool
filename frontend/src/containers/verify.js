import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import RequestProof from '../components/request-proof';
import { sendProofRequest } from '../store/actions';

const Verify = ({
  connections,
  credDefs,
  doSendProofRequest,
  defaultValues,
  sendingProofRequest,
}) => (
  <RequestProof
    connections={connections}
    credDefs={credDefs}
    defaultValues={defaultValues}
    onSendProofRequest={doSendProofRequest}
    sending={sendingProofRequest}
  />
);

Verify.propTypes = {
  connections: PropTypes.arrayOf(PropTypes.object).isRequired,
  credDefs: PropTypes.arrayOf(PropTypes.string).isRequired,
  doSendProofRequest: PropTypes.func.isRequired,
  defaultValues: PropTypes.object.isRequired,
  sendingProofRequest: PropTypes.bool.isRequired,
};

const mapStateToProps = ({
  ledger,
  connections,
  result: { sendingProofRequest },
}) => ({
  connections: connections || [],
  credDefs: ledger ? ledger.credDefs : [],
  defaultValues: ledger ? ledger.credDefsWithDefaults : {},
  sendingProofRequest,
});

const mapDispatchToProps = (dispatch) => ({
  doSendProofRequest: (body) => dispatch(sendProofRequest(body)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Verify);
