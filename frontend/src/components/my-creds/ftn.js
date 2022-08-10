import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Paper } from '@material-ui/core';
import styled from 'styled-components';

import PairwiseEditor from '../pairwise-editor';
import { Header, Button, Section } from './style';

const CredPaper = styled(Paper)`
  padding: 1rem;
`;

function FtnCred({
  connections,
  credDefs,
  onFetchUrl,
  config,
  urls,
  user,
  sendCredential,
}) {
  const [ftnPairwiseName, setFtnPairwiseName] = useState('');
  const [urlFetched, setUrlFetched] = useState(false);
  const credDefId = credDefs.find((item) => item.toLowerCase().includes('ftn'));
  useEffect(() => {
    if (config.creds && config.creds.ftn.url && !urlFetched) {
      onFetchUrl({ url: config.creds.ftn.url });
      setUrlFetched(true);
    }
  });

  const authUrl = config.creds ? urls[config.creds.ftn.url] : '';
  const ftnCred = user.creds.find((item) => item.id === 'ftn');
  const authenticateStr = ftnCred ? 'Reauthenticate' : 'Authenticate';
  return (
    <Section>
      <Header>FTN cred</Header>
      <div>CredDef: {credDefId}</div>

      {credDefId ? (
        <div>
          <strong>{authenticateStr} via FTN:</strong>
          {authUrl ? (
            <a href={authUrl}>
              <Button>{authenticateStr}</Button>
            </a>
          ) : (
            <div />
          )}

          {ftnCred && (
            <div>
              <div>
                <h3>FTN credential values</h3>
                <CredPaper>
                  {Object.keys(ftnCred.values).map((key) => (
                    <div key={key}>
                      {key}: {ftnCred.values[key]}
                    </div>
                  ))}
                </CredPaper>
              </div>
              <PairwiseEditor
                name={ftnPairwiseName}
                onSetName={setFtnPairwiseName}
                connections={connections}
                title="Send FTN credential"
                description="Send FTN credential to pairwise connection"
              >
                <Button
                  onClick={() =>
                    sendCredential({
                      connectionId: ftnPairwiseName,
                      values: ftnCred.values,
                      credDefId,
                    })
                  }
                >
                  Send credential
                </Button>
              </PairwiseEditor>
            </div>
          )}
        </div>
      ) : (
        <div>
          Create cred def tagged &quot;FTN&quot; with schema attributes
          &quot;name&quot;, &quot;given_name&quot;, &quot;family_name&quot;,
          &quot;birthdate&quot;, &quot;personal_identity_code&quot;,
          &quot;auth_time&quot;
        </div>
      )}
    </Section>
  );
}

FtnCred.propTypes = {
  connections: PropTypes.arrayOf(PropTypes.object).isRequired,
  credDefs: PropTypes.arrayOf(PropTypes.string).isRequired,
  onFetchUrl: PropTypes.func.isRequired,
  config: PropTypes.object.isRequired,
  urls: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  sendCredential: PropTypes.func.isRequired,
};

export default FtnCred;
