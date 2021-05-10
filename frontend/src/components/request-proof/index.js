import React, { useState } from 'react';
import PropTypes from 'prop-types';

import PairwiseForm from '../pairwise-form';
import PairwiseEditor from '../pairwise-editor';

const RequestProof = ({
  connections,
  credDefs,
  onSendProofRequest,
  defaultValues,
}) => {
  const [pairwiseName, setPairwiseName] = useState('');
  return (
    <PairwiseEditor
      name={pairwiseName}
      onSetName={setPairwiseName}
      connections={connections}
      title="Request proof"
      description="Request proof from pairwise connection"
    >
      <PairwiseForm
        credDefs={credDefs}
        defaultValues={defaultValues}
        onSend={(values, credDefId) =>
          onSendProofRequest({
            name: pairwiseName,
            values,
            credDefId,
          })
        }
      />
    </PairwiseEditor>
  );
};

RequestProof.propTypes = {
  connections: PropTypes.arrayOf(PropTypes.object).isRequired,
  credDefs: PropTypes.arrayOf(PropTypes.string).isRequired,
  onSendProofRequest: PropTypes.func.isRequired,
  defaultValues: PropTypes.object.isRequired,
};

export default RequestProof;
