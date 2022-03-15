import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import PairwiseEditor from '../pairwise-editor';
import { Header, Button, Section } from './style';

const IsbCred = ({
  connections,
  credDefs,
  onFetchUrl,
  config,
  urls,
  user,
  sendCredential,
}) => {
  const [isbPairwiseName, setIsbPairwiseName] = useState('');
  const [urlFetched, setUrlFetched] = useState(false);
  const credDefId = credDefs.find((item) => item.toLowerCase().includes('isb'));
  useEffect(() => {
    if (config.creds && config.creds.isb.url && !urlFetched) {
      onFetchUrl({ url: config.creds.isb.url });
      setUrlFetched(true);
    }
  });

  // TODO: fetch url on load
  const authUrl = config.creds ? urls[config.creds.isb.url] : '';
  const isbCred = user.creds.find((item) => item.id === 'isb');
  const authenticateStr = isbCred ? 'Reauthenticate' : 'Authenticate';
  return (
    <Section>
      <Header>ISB cred</Header>
      {credDefId ? (
        <div>
          <p>{authenticateStr} via ISB:</p>
          {authUrl ? (
            <a href={authUrl}>
              <Button>{authenticateStr}</Button>
            </a>
          ) : (
            <div />
          )}

          <div>
            <h3>ISB credential values</h3>
            {Object.keys(isbCred.values).map((key) => (
              <div key={key}>
                {key}: {isbCred.values[key]}
              </div>
            ))}
          </div>
          {isbCred && (
            <div>
              <PairwiseEditor
                name={isbPairwiseName}
                onSetName={setIsbPairwiseName}
                connections={connections}
                title="Send ISB credential"
                description="Send ISB credential to pairwise connection"
              >
                <Button
                  onClick={() =>
                    sendCredential({
                      connectionId: isbPairwiseName,
                      values: isbCred.values,
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
          Create cred def tagged &quot;ISB&quot; with schema attributes
          &quot;name&quot;, &quot;given_name&quot;, &quot;family_name&quot;,
          &quot;birthdate&quot;, &quot;personal_identity_code&quot;,
          &quot;auth_time&quot;
        </div>
      )}
    </Section>
  );
};

IsbCred.propTypes = {
  connections: PropTypes.arrayOf(PropTypes.object).isRequired,
  credDefs: PropTypes.arrayOf(PropTypes.string).isRequired,
  onFetchUrl: PropTypes.func.isRequired,
  config: PropTypes.object.isRequired,
  urls: PropTypes.object.isRequired,
};

export default IsbCred;
