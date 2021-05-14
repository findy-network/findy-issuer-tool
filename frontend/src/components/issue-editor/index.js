import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button } from '@material-ui/core';

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

const IssueEditor = ({ credDefs, onSend, defaultValues }) => {
  const [credDefId, setCredDefId] = useState('');
  const defaultAttributes = {};
  const [addAttribute, setAddAttribute] = useState(null);
  const [attributes, setAttributes] = useState(defaultAttributes);
  const canReset = credDefId !== '' && attributes.length !== defaultAttributes;
  const canSave = credDefId.length > 0 && Object.keys(attributes).length > 0;
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
  // TODO: add values with button
  const attrValue = (index, key, value, showSave) => (
    <RowContainer key={`${index + 1}. attribute`}>
      <TextField
        rows="1"
        label="Name"
        value={key}
        readOnly={!showSave && 'readonly'}
        onChange={(k) =>
          showSave && setAddAttribute({ ...addAttribute, key: k })
        }
      />
      <TextField
        rows="1"
        label="Value"
        value={value}
        readOnly={!showSave && 'readonly'}
        onChange={(v) =>
          showSave && setAddAttribute({ ...addAttribute, value: v })
        }
      />
      <SaveButtonContainer>
        {showSave && (
          <Button
            disabled={!key}
            onClick={() => {
              setAttributes({
                ...attributes,
                [addAttribute.key]: addAttribute.value,
              });
              setAddAttribute(null);
            }}
          >
            Save
          </Button>
        )}
        <Button
          onClick={() => {
            const newValue = Object.keys(attributes)
              .filter((itemKey) => itemKey !== key)
              .reduce(
                (result, item) => ({
                  ...result,
                  [item]: attributes[item],
                }),
                {}
              );
            setAttributes(newValue);
          }}
        >
          Remove
        </Button>
      </SaveButtonContainer>
    </RowContainer>
  );

  return (
    <Container>
      <DropDown
        value={credDefId}
        values={credDefs.map((item) => ({ id: item, title: item }))}
        onValueChange={handleCredDef}
        label="Credential definition"
      />
      {Object.keys(attributes).map((item, index) =>
        attrValue(index, item, attributes[item])
      )}
      {addAttribute &&
        attrValue(
          Object.keys(attributes).length,
          addAttribute.key,
          addAttribute.value,
          true
        )}
      <Button
        disabled={!credDefId}
        onClick={() => setAddAttribute({ key: '', value: '' })}
      >
        New attribute
      </Button>

      <EditorButtons
        canReset={canReset}
        onReset={handleReset}
        canSave={canSave}
        onSave={() => onSend(attributes, credDefId)}
        okLabel="Send"
      />
    </Container>
  );
};

IssueEditor.propTypes = {
  credDefs: PropTypes.arrayOf(PropTypes.string).isRequired,
  onSend: PropTypes.func.isRequired,
  defaultValues: PropTypes.object.isRequired,
};

export default IssueEditor;
