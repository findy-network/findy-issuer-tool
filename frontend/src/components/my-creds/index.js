import React, { useState } from 'react';
import PropTypes from 'prop-types';

import PairwiseEditor from '../pairwise-editor';
import IsbCred from './isb';
import { Header, ButtonContainer, Button, Section } from './style';

const MyCreds = (props) => {
  const { connections, credDefs, onSendCredential, user, sending } = props;

  const [pairwiseName, setPairwiseName] = useState('');
  const credDefId = credDefs.find((item) =>
    item.toLowerCase().includes('github')
  );
  const { name, id, email } = user;
  return (
    <div>
      <Section>
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
                onClick={() => {
                  onSendCredential({
                    connectionId: pairwiseName,
                    values: { name, id, email },
                    credDefId,
                  });
                  setPairwiseName('');
                }}
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
      </Section>

      <IsbCred {...props} sendCredential={onSendCredential} />
    </div>
  );
};

MyCreds.propTypes = {
  connections: PropTypes.arrayOf(PropTypes.object).isRequired,
  credDefs: PropTypes.arrayOf(PropTypes.string).isRequired,
  onSendCredential: PropTypes.func.isRequired,
  onFetchUrl: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
  sending: PropTypes.bool.isRequired,
  config: PropTypes.object.isRequired,
  urls: PropTypes.object.isRequired,
};

export default MyCreds;
