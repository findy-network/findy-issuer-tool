import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import TextFieldComponent from '@mui/material/TextField';

const TextField = styled(TextFieldComponent)`
  width: 30rem;
`;

function TextInput({ onChange, ...props }) {
  return (
    <TextField
      multiline
      rows="10"
      margin="normal"
      variant="outlined"
      onChange={({ target: { value } }) => onChange(value)}
      {...props}
    />
  );
}

TextInput.propTypes = {
  label: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default TextInput;
