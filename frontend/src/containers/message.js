import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import SendMessage from '../components/send-message';
import { sendBasicMessage } from '../store/actions';

const Message = ({ connections, doSendBasicMessage }) => (
  <SendMessage connections={connections} onSendMessage={doSendBasicMessage} />
);

Message.propTypes = {
  connections: PropTypes.arrayOf(PropTypes.object).isRequired,
  doSendBasicMessage: PropTypes.func.isRequired,
};

const mapStateToProps = ({ connections }) => ({
  connections: connections || [],
});

const mapDispatchToProps = (dispatch) => ({
  doSendBasicMessage: (body) => dispatch(sendBasicMessage(body)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Message);
