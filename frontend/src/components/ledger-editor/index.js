import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import Typography from '@material-ui/core/Typography';
import InputEditor from '../input-editor';
import LedgerLink from '../ledger-link';

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

const LedgerEditor = ({
  doSaveEditorItem,
  value,
  txnType,
  title,
  label,
  description,
  defaultValue,
  items,
}) => (
  <Container>
    <div>
      {value && (
        <Typography variant="subtitle2">
          {`Successfully saved ${title} with id`}
          <LedgerLink value={value} txnType={txnType} />
        </Typography>
      )}
      <InputEditor
        title={title}
        label={label}
        description={description}
        onSave={doSaveEditorItem}
        defaultValue={defaultValue}
      />
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

LedgerEditor.propTypes = {
  doSaveEditorItem: PropTypes.func.isRequired,
  value: PropTypes.string,
  txnType: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  description: PropTypes.string,
  defaultValue: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.string),
};

LedgerEditor.defaultProps = {
  value: null,
  description: null,
  items: [],
};

export default LedgerEditor;
