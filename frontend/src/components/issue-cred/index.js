import React, { useState } from 'react';
import PropTypes from 'prop-types';

import CredEditor from '../cred-editor';
import PairwiseEditor from '../pairwise-editor';

const IssueCred = ({
  connections,
  credDefs,
  onSendCredential,
  defaultValues,
  sending,
}) => {
  const [pairwiseName, setPairwiseName] = useState('');
  return (
    <PairwiseEditor
      name={pairwiseName}
      onSetName={setPairwiseName}
      connections={connections}
      title="Send credential"
      description="Send credential to pairwise connection"
    >
      <CredEditor
        credDefs={credDefs}
        defaultValues={defaultValues}
        onSend={(values, credDefId) =>
          onSendCredential({
            connectionId: pairwiseName,
            values,
            credDefId,
          })
        }
        sending={sending}
      />
    </PairwiseEditor>
  );
};

IssueCred.propTypes = {
  connections: PropTypes.arrayOf(PropTypes.object).isRequired,
  credDefs: PropTypes.arrayOf(PropTypes.string).isRequired,
  onSendCredential: PropTypes.func.isRequired,
  defaultValues: PropTypes.object.isRequired,
  sending: PropTypes.bool.isRequired,
};

export default IssueCred;
