import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import TextField from '../text-input';
import EditorButtons from '../editor-buttons';
import DropDown from '../drop-down';

const Container = styled.div``;

const PairwiseForm = ({ credDefs, onSend, defaultValues }) => {
  const [credDefId, setCredDefId] = useState('');
  const defaultAttributes = '{"attribute":"value"}';
  const [attributes, setAttributes] = useState(defaultAttributes);
  const canReset = credDefId !== '' && attributes.length !== defaultAttributes;
  const canSave = credDefId.length > 0 && attributes.length > 0;
  const handleReset = () => {
    setCredDefId('');
    setAttributes(defaultAttributes);
  };
  const handleCredDef = (value) => {
    setCredDefId(value);
    if (value) {
      const newDefault = defaultValues[value];
      if (newDefault) {
        setAttributes(JSON.stringify(newDefault));
      }
    } else {
      setAttributes(defaultAttributes);
    }
  };

  return (
    <Container>
      <DropDown
        value={credDefId}
        values={credDefs.map((item) => ({ id: item, title: item }))}
        onValueChange={handleCredDef}
        label="Credential definition"
      />
      <TextField label="Value" onChange={setAttributes} value={attributes} />

      <EditorButtons
        canReset={canReset}
        onReset={handleReset}
        canSave={canSave}
        onSave={() => onSend(JSON.parse(attributes), credDefId)}
        okLabel="Send"
      />
    </Container>
  );
};

PairwiseForm.propTypes = {
  credDefs: PropTypes.arrayOf(PropTypes.string).isRequired,
  onSend: PropTypes.func.isRequired,
  defaultValues: PropTypes.object.isRequired,
};

export default PairwiseForm;
