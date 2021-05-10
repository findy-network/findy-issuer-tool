import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import IssueCred from '../components/issue-cred';
import { sendCredential } from '../store/actions';

const Issue = ({ connections, credDefs, doSendCredential, defaultValues }) => (
  <IssueCred
    connections={connections}
    credDefs={credDefs}
    defaultValues={defaultValues}
    onSendCredential={doSendCredential}
  />
);

Issue.propTypes = {
  connections: PropTypes.arrayOf(PropTypes.object).isRequired,
  credDefs: PropTypes.arrayOf(PropTypes.string).isRequired,
  doSendCredential: PropTypes.func.isRequired,
  defaultValues: PropTypes.object.isRequired,
};

const mapStateToProps = ({ ledger, connections }) => ({
  connections: connections || [],
  credDefs: ledger ? ledger.credDefs : [],
  defaultValues: ledger ? ledger.credDefsWithDefaults : {},
});

const mapDispatchToProps = (dispatch) => ({
  doSendCredential: (body) => dispatch(sendCredential(body)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Issue);
