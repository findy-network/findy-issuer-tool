import React, { useState } from 'react';
import PropTypes from 'prop-types';

import PairwiseEditor from '../pairwise-editor';
import TextField from '../text-input';
import EditorButtons from '../editor-buttons';

const SendMessage = ({ connections, onSendMessage }) => {
  const [pairwiseName, setPairwiseName] = useState('');
  const [message, setMessage] = useState('');
  const canResetMessage = message !== '';
  const canSaveMessage = pairwiseName.length > 0 && message.length > 0;
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
};

export default SendMessage;
