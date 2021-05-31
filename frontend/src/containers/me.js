import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import MyCreds from '../components/my-creds';
import { sendCredential } from '../store/actions';

const Me = ({
  connections,
  credDefs,
  doSendCredential,
  user,
  sendingCredential,
}) => (
  <MyCreds
    connections={connections}
    credDefs={credDefs}
    user={user}
    onSendCredential={doSendCredential}
    sending={sendingCredential}
  />
);

Me.propTypes = {
  connections: PropTypes.arrayOf(PropTypes.object).isRequired,
  credDefs: PropTypes.arrayOf(PropTypes.string).isRequired,
  doSendCredential: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
  sendingCredential: PropTypes.bool.isRequired,
};

const mapStateToProps = ({
  user,
  ledger,
  connections,
  result: { sendingCredential },
}) => ({
  connections: connections || [],
  credDefs: ledger ? ledger.credDefs : [],
  user,
  sendingCredential,
});

const mapDispatchToProps = (dispatch) => ({
  doSendCredential: (body) => dispatch(sendCredential(body)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Me);
