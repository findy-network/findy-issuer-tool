import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button } from '@mui/material';

import TextField from '../text-input';
import EditorButtons from '../editor-buttons';
import DropDown from '../drop-down';

const Container = styled.div``;

const RowContainer = styled.div`
  display: flex;
  padding-bottom: 1rem;
  border-bottom: dashed 1px darkgray;
`;

const SaveButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

function CredEditor({ credDefs, onSend, defaultValues, sending }) {
  const [credDefId, setCredDefId] = useState('');
  const defaultAttributes = [];
  const [attributes, setAttributes] = useState(defaultAttributes);
  const canReset = !sending && credDefId !== '' && attributes.length > 0;
  const canSave =
    !sending && credDefId.length > 0 && Object.keys(attributes).length > 0;
  const handleReset = () => {
    setCredDefId('');
    setAttributes(defaultAttributes);
  };
  const handleCredDef = (value) => {
    setCredDefId(value);
    const newDefault = defaultValues[value];
    if (value && newDefault) {
      setAttributes(
        Object.keys(newDefault).map((key) => ({
          key,
          value: newDefault[key],
        })),
      );
    } else {
      setAttributes(defaultAttributes);
    }
  };
  const attrValue = (index, item) => (
    <RowContainer key={`${index + 1}. attribute`}>
      <TextField
        id={`attribute-${index}-name`}
        rows="1"
        label="Name"
        value={item.key}
        onChange={(k) =>
          setAttributes(
            attributes.map((prevItem, itemIndex) =>
              index === itemIndex
                ? { key: k, value: prevItem.value }
                : prevItem,
            ),
          )
        }
      />
      <TextField
        id={`attribute-${index}-value`}
        rows="1"
        label="Value"
        value={item.value}
        onChange={(v) =>
          setAttributes(
            attributes.map((prevItem, itemIndex) =>
              index === itemIndex ? { value: v, key: prevItem.key } : prevItem,
            ),
          )
        }
      />
      <SaveButtonContainer>
        <Button
          onClick={() =>
            setAttributes(
              attributes.filter((_, itemIndex) => index !== itemIndex),
            )
          }
        >
          Remove
        </Button>
      </SaveButtonContainer>
    </RowContainer>
  );

  return (
    <Container>
      <DropDown
        id="cred-def-selection"
        value={credDefId}
        values={credDefs.map((item) => ({ id: item, title: item }))}
        onValueChange={handleCredDef}
        label="Credential definition"
      />
      {attributes.length > 0 && <p>Attributes</p>}
      {attributes.map((item, index) => attrValue(index, item))}
      <Button
        id="add-attribute-button"
        disabled={!credDefId}
        onClick={() => setAttributes([...attributes, { key: '', value: '' }])}
      >
        Add attribute
      </Button>

      <EditorButtons
        id="send-cred"
        canReset={canReset}
        onReset={handleReset}
        canSave={canSave}
        onSave={() =>
          onSend(
            attributes.reduce(
              (result, item) => ({
                ...result,
                [item.key]: item.value,
              }),
              {},
            ),
            credDefId,
          )
        }
        okLabel="Send"
      />
    </Container>
  );
}

CredEditor.propTypes = {
  credDefs: PropTypes.arrayOf(PropTypes.string).isRequired,
  onSend: PropTypes.func.isRequired,
  defaultValues: PropTypes.object.isRequired,
  sending: PropTypes.bool.isRequired,
};

export default CredEditor;
