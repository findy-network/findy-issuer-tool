import React, { useState } from 'react';
import PropTypes from 'prop-types';

import PairwiseEditor from '../pairwise-editor';
import TextField from '../text-input';
import EditorButtons from '../editor-buttons';

const SendMessage = ({ connections, onSendMessage, sending }) => {
  const [pairwiseName, setPairwiseName] = useState('');
  const [message, setMessage] = useState('');
  const canResetMessage = !sending && message !== '';
  const canSaveMessage =
    !sending && pairwiseName.length > 0 && message.length > 0;
  const handleResetMessage = () => setMessage('');
  return (
    <PairwiseEditor
      name={pairwiseName}
      onSetName={setPairwiseName}
      connections={connections}
      title="Basic message"
      description="Send text message to pairwise connection"
    >
      <TextField label="Message" onChange={setMessage} value={message} />
      <EditorButtons
        id="chat-message"
        canReset={canResetMessage}
        onReset={handleResetMessage}
        canSave={canSaveMessage}
        onSave={() => {
          setMessage('');
          return onSendMessage({ connectionId: pairwiseName, msg: message });
        }}
        okLabel="Send"
      />
    </PairwiseEditor>
  );
};

SendMessage.propTypes = {
  connections: PropTypes.arrayOf(PropTypes.object).isRequired,
  onSendMessage: PropTypes.func.isRequired,
  sending: PropTypes.bool.isRequired,
};

export default SendMessage;
