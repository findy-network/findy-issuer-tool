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
}) => (
  <RequestProof
    connections={connections}
    credDefs={credDefs}
    defaultValues={defaultValues}
    onSendProofRequest={doSendProofRequest}
  />
);

Verify.propTypes = {
  connections: PropTypes.arrayOf(PropTypes.object).isRequired,
  credDefs: PropTypes.arrayOf(PropTypes.string).isRequired,
  doSendProofRequest: PropTypes.func.isRequired,
  defaultValues: PropTypes.object.isRequired,
};

const mapStateToProps = ({ ledger, connections }) => ({
  connections: connections || [],
  credDefs: ledger ? ledger.credDefs : [],
  defaultValues: ledger ? ledger.credDefsWithDefaults : {},
});

const mapDispatchToProps = (dispatch) => ({
  doSendProofRequest: (body) => dispatch(sendProofRequest(body)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Verify);
