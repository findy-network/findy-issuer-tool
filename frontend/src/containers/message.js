import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import SendMessage from '../components/send-message';
import { sendBasicMessage } from '../store/actions';

function Message({ connections, doSendBasicMessage, sendingBasicMessage }) {
  return (
    <SendMessage
      connections={connections}
      onSendMessage={doSendBasicMessage}
      sending={sendingBasicMessage}
    />
  );
}

Message.propTypes = {
  connections: PropTypes.arrayOf(PropTypes.object).isRequired,
  doSendBasicMessage: PropTypes.func.isRequired,
  sendingBasicMessage: PropTypes.bool.isRequired,
};

const mapStateToProps = ({ connections, result: { sendingBasicMessage } }) => ({
  connections: connections || [],
  sendingBasicMessage,
});

const mapDispatchToProps = (dispatch) => ({
  doSendBasicMessage: (body) => dispatch(sendBasicMessage(body)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Message);
