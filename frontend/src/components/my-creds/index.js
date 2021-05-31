import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Typography, Button as BaseButton } from '@material-ui/core';

import PairwiseEditor from '../pairwise-editor';

const Header = styled(Typography)`
  margin-top: 1rem !important;
  font-weight: bold !important;
`;

const ButtonContainer = styled.div`
  margin-bottom: 1rem;
  text-align: right;
`;

const Button = styled(BaseButton)`
  ${(props) => !props.disabled && `display: inline-block;`}
`;

const IssueCred = ({
  connections,
  credDefs,
  onSendCredential,
  user,
  sending,
}) => {
  const [pairwiseName, setPairwiseName] = useState('');
  const credDefId = credDefs.find((item) =>
    item.toLowerCase().includes('github')
  );
  const { name, id, email } = user;
  return (
    <div>
      <Header>GitHub cred</Header>
      {credDefId ? (
        <PairwiseEditor
          name={pairwiseName}
          onSetName={setPairwiseName}
          connections={connections}
          title="Send GitHub credential"
          description="Send GitHub credential to pairwise connection"
        >
          <div>
            <div>Name: {name}</div>
            <div>Email: {email}</div>
            <div>GitHub id: {id}</div>
            <div>CredDef: {credDefId}</div>
          </div>
          <ButtonContainer>
            <Button
              disabled={sending}
              onClick={() =>
                onSendCredential({
                  connectionId: pairwiseName,
                  values: { name, id, email },
                  credDefId,
                })
              }
            >
              Send
            </Button>
          </ButtonContainer>
        </PairwiseEditor>
      ) : (
        <div>
          Create cred def tagged &quot;GitHub&quot; with schema attributes
          &quot;id&quot;, &quot;name&quot;, &quot;email&quot;
        </div>
      )}
    </div>
  );
};

IssueCred.propTypes = {
  connections: PropTypes.arrayOf(PropTypes.object).isRequired,
  credDefs: PropTypes.arrayOf(PropTypes.string).isRequired,
  onSendCredential: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
  sending: PropTypes.bool.isRequired,
};

export default IssueCred;
