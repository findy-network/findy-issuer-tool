import React, { useState } from 'react';
import PropTypes from 'prop-types';

import PairwiseEditor from '../pairwise-editor';
import { Header, ButtonContainer, Button, Section } from './style';

const IsbCred = ({
  connections,
  credDefs,
  onSendCredential,
  onFetchUrl,
  user,
  sending,
  config,
  urls,
}) => {
  const [isbPairwiseName, setIsbPairwiseName] = useState('');
  const onPwChange = (name) => {
    if (isbPairwiseName !== name) {
      onFetchUrl({ url: config.creds.isb.url, pairwiseName: name });
    }
    setIsbPairwiseName(name);
  };
  /*const credDefId = credDefs.find((item) =>
    item.toLowerCase().includes('github')
  );*/
  const authUrl = config.creds ? urls[config.creds.isb.url] : '';
  return (
    <Section>
      <Header>ISB cred</Header>
      <PairwiseEditor
        name={isbPairwiseName}
        onSetName={onPwChange}
        connections={connections}
        title="Send ISB credential"
        description="Send ISB credential to pairwise connection"
      >
        {authUrl ? (
          <a href={authUrl}>
            <Button>Authenticate</Button>
          </a>
        ) : (
          <div />
        )}
      </PairwiseEditor>
    </Section>
  );
};

IsbCred.propTypes = {
  connections: PropTypes.arrayOf(PropTypes.object).isRequired,
  credDefs: PropTypes.arrayOf(PropTypes.string).isRequired,
  onSendCredential: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
  sending: PropTypes.bool.isRequired,
  config: PropTypes.object.isRequired,
};

export default IsbCred;
