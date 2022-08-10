import React, { useState } from 'react';
import PropTypes from 'prop-types';

import CredEditor from '../cred-editor';
import PairwiseEditor from '../pairwise-editor';

function RequestProof({
  connections,
  credDefs,
  onSendProofRequest,
  defaultValues,
  sending,
}) {
  const [pairwiseName, setPairwiseName] = useState('');
  return (
    <PairwiseEditor
      name={pairwiseName}
      onSetName={setPairwiseName}
      connections={connections}
      title="Request proof"
      description="Request proof from pairwise connection"
    >
      <CredEditor
        credDefs={credDefs}
        defaultValues={defaultValues}
        onSend={(values, credDefId) =>
          onSendProofRequest({
            connectionId: pairwiseName,
            attributes: values,
            credDefId,
          })
        }
        sending={sending}
      />
    </PairwiseEditor>
  );
}

RequestProof.propTypes = {
  connections: PropTypes.arrayOf(PropTypes.object).isRequired,
  credDefs: PropTypes.arrayOf(PropTypes.string).isRequired,
  onSendProofRequest: PropTypes.func.isRequired,
  defaultValues: PropTypes.object.isRequired,
  sending: PropTypes.bool.isRequired,
};

export default RequestProof;
