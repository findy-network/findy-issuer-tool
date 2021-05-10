import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import Typography from '@material-ui/core/Typography';
import TextField from '../text-input';
import EditorButtons from '../editor-buttons';

const Container = styled.div`
  margin-top: 1rem;
`;

const Description = styled.div`
  font-style: italic;
`;

const Header = styled(Typography)`
  font-weight: bold !important;
`;

const InputEditor = ({ title, defaultValue, label, description, onSave }) => {
  const [value, setValue] = useState(defaultValue);

  return (
    <Container>
      <Header>{title}</Header>
      {description && <Description>{description}</Description>}
      <TextField label={label} onChange={setValue} value={value} />
      <EditorButtons
        canReset={value === defaultValue}
        onReset={() => setValue(defaultValue)}
        canSave={value.length > 1}
        onSave={() => onSave(value)}
      />
    </Container>
  );
};

InputEditor.propTypes = {
  defaultValue: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  description: PropTypes.string,
  title: PropTypes.string.isRequired,
  onSave: PropTypes.func.isRequired,
};

InputEditor.defaultProps = {
  description: null,
};

export default InputEditor;
