import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import MyCreds from '../components/my-creds';
import { fetchUrl, sendCredential } from '../store/actions';

const Me = ({
  connections,
  credDefs,
  doSendCredential,
  doFetchUrl,
  user,
  sendingCredential,
  config,
  urls,
}) => (
  <MyCreds
    connections={connections}
    credDefs={credDefs}
    user={user}
    onSendCredential={doSendCredential}
    onFetchUrl={doFetchUrl}
    sending={sendingCredential}
    config={config}
    urls={urls}
  />
);

Me.propTypes = {
  connections: PropTypes.arrayOf(PropTypes.object).isRequired,
  credDefs: PropTypes.arrayOf(PropTypes.string).isRequired,
  doSendCredential: PropTypes.func.isRequired,
  doFetchUrl: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
  sendingCredential: PropTypes.bool.isRequired,
  config: PropTypes.object.isRequired,
  urls: PropTypes.object.isRequired,
};

const mapStateToProps = ({
  user,
  ledger,
  connections,
  result: { sendingCredential, url: urls },
  config,
}) => ({
  connections: connections || [],
  credDefs: ledger ? ledger.credDefs : [],
  user,
  sendingCredential,
  config: config || {},
  urls,
});

const mapDispatchToProps = (dispatch) => ({
  doSendCredential: (body) => dispatch(sendCredential(body)),
  doFetchUrl: (url) => dispatch(fetchUrl(url)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Me);
