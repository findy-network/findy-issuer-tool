import React, { useState } from 'react';
import PropTypes from 'prop-types';

import PairwiseForm from '../pairwise-form';
import PairwiseEditor from '../pairwise-editor';

const IssueCred = ({
  connections,
  credDefs,
  onSendCredential,
  defaultValues,
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
      <PairwiseForm
        credDefs={credDefs}
        defaultValues={defaultValues}
        onSend={(values, credDefId) =>
          onSendCredential({
            name: pairwiseName,
            values,
            credDefId,
          })
        }
      />
    </PairwiseEditor>
  );
};

IssueCred.propTypes = {
  connections: PropTypes.arrayOf(PropTypes.object).isRequired,
  credDefs: PropTypes.arrayOf(PropTypes.string).isRequired,
  onSendCredential: PropTypes.func.isRequired,
  defaultValues: PropTypes.object.isRequired,
};

export default IssueCred;
