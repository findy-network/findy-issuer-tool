import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import Typography from '@material-ui/core/Typography';
import LedgerLink from '../ledger-link';
import TextField from '../text-input';
import EditorButtons from '../editor-buttons';
import DropDown from '../drop-down';

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
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

const CredDefEditor = ({
  doSaveEditorItem,
  txnType,
  title,
  description,
  items,
  value: result,
  schemas,
  sending,
}) => {
  const defaultValue = {
    schemaId: '',
    tag: '',
  };
  const [value, setValue] = useState(defaultValue);

  return (
    <Container>
      <div>
        {result && (
          <Typography variant="subtitle2">
            {`Successfully saved ${title} with id`}
            <LedgerLink value={result} txnType={txnType} />
          </Typography>
        )}
        <FormContainer>
          <Header>{title}</Header>
          {description && <Description>{description}</Description>}
          <DropDown
            value={value.schemaId}
            values={schemas.map((item) => ({
              id: item,
              title: item,
            }))}
            onValueChange={(schemaId) => setValue({ ...value, schemaId })}
            label={value.schemaId ? 'Schema' : 'Select schema'}
          />
          <TextField
            rows="1"
            label="Tag e.g. Passport"
            onChange={(tag) => setValue({ ...value, tag })}
            value={value.tag}
          />

          <EditorButtons
            canReset={
              value.schemaId !== defaultValue.schemaId &&
              value.tag !== defaultValue.tag
            }
            onReset={() => setValue(defaultValue)}
            canSave={!sending && value.schemaId !== '' && value.tag !== ''}
            onSave={() => doSaveEditorItem(value)}
          />
        </FormContainer>
      </div>
      {items.length > 0 && (
        <div>
          <ItemsHeader>{title}s created by us:</ItemsHeader>
          {items.map((item) => (
            <ItemContainer key={item}>
              <LedgerLink value={item} txnType={txnType} />
            </ItemContainer>
          ))}
        </div>
      )}
    </Container>
  );
};

CredDefEditor.propTypes = {
  doSaveEditorItem: PropTypes.func.isRequired,
  value: PropTypes.string,
  txnType: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  items: PropTypes.arrayOf(PropTypes.string),
  schemas: PropTypes.arrayOf(PropTypes.string),
  sending: PropTypes.bool.isRequired,
};

CredDefEditor.defaultProps = {
  value: null,
  description: null,
  items: [],
  schemas: [],
};

export default CredDefEditor;
