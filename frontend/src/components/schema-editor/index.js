import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button } from '@mui/material';

import Typography from '@mui/material/Typography';
import LedgerLink from '../ledger-link';
import TextField from '../text-input';
import EditorButtons from '../editor-buttons';

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 2rem;
`;

const ItemContainer = styled.div`
  padding-top: 1rem;
  padding-bottom: 0.5rem;
  margin-left: 2rem;
  border-bottom: 1px solid darkgray;
`;

const ItemsHeader = styled.div`
  margin-left: 2rem;
  padding-top: 1rem;
`;

const FormContainer = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
`;

const Description = styled.div`
  font-style: italic;
`;

const Header = styled(Typography)`
  font-weight: bold !important;
`;

function SchemaEditor({
  doSaveEditorItem,
  txnType,
  title,
  description,
  items,
  value: result,
  sending,
}) {
  const defaultValue = {
    attrs: [],
    name: '',
    version: '',
  };
  const [value, setValue] = useState(defaultValue);
  const trimSchema = (schema) => ({
    ...schema,
    attrs: schema.attrs.filter((item) => item),
  });

  return (
    <Container>
      <div>
        <FormContainer>
          <Header>{title}</Header>
          {description && <Description>{description}</Description>}
          <TextField
            id="schema-name"
            rows="1"
            label="Name e.g. Email"
            onChange={(name) => setValue({ ...value, name })}
            value={value.name}
          />
          <TextField
            id="schema-version"
            rows="1"
            label="Version e.g. 1.0"
            onChange={(version) => setValue({ ...value, version })}
            value={value.version}
          />
          {value.attrs.map((item, index) => (
            <TextField
              id={`schema-${index}-attribute`}
              key={`${index + 1}. attribute`}
              rows="1"
              label={`${index + 1}. attribute`}
              onChange={(attr) =>
                setValue({
                  ...value,
                  attrs: value.attrs.map((attrItem, itemIndex) =>
                    itemIndex === index ? attr : attrItem,
                  ),
                })
              }
              value={item}
            />
          ))}
          <Button
            id="add-attribute-button"
            onClick={() => setValue({ ...value, attrs: [...value.attrs, ''] })}
          >
            Add attribute
          </Button>

          <EditorButtons
            id="schema"
            canReset={
              (() => {
                const schema = trimSchema(value);
                return (
                  schema.name !== defaultValue.name ||
                  schema.version !== defaultValue.version ||
                  schema.attrs.length !== 0 ||
                  schema.attrs.find(
                    (item, index) => item !== defaultValue.attrs[index],
                  )
                );
              })() || false
            }
            onReset={() => setValue(defaultValue)}
            canSave={
              !sending &&
              (() => {
                const schema = trimSchema(value);
                return (
                  schema.name !== '' &&
                  schema.version !== '' &&
                  schema.attrs.length > 0
                );
              })()
            }
            onSave={() => doSaveEditorItem(trimSchema(value))}
          />
          {result && (
            <Typography variant="subtitle2">
              {`Successfully saved ${title} with id`}
              <LedgerLink id="schema-id" value={result} txnType={txnType} />
            </Typography>
          )}
          {items.length > 0 && (
            <div>
              <ItemsHeader>{title}s created by us:</ItemsHeader>
              {items.map((item, index) => (
                <ItemContainer key={item} id={`${title}-item-${index}`}>
                  <LedgerLink id={item} value={item} txnType={txnType} />
                </ItemContainer>
              ))}
            </div>
          )}
        </FormContainer>
      </div>
    </Container>
  );
}

SchemaEditor.propTypes = {
  doSaveEditorItem: PropTypes.func.isRequired,
  value: PropTypes.string,
  txnType: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  items: PropTypes.arrayOf(PropTypes.string),
  sending: PropTypes.bool.isRequired,
};

SchemaEditor.defaultProps = {
  value: null,
  description: null,
  items: [],
};

export default SchemaEditor;
