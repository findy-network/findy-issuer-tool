import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import MUIContainer from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';

export const Container = styled(MUIContainer)`
  margin-top: 3rem;
`;

export const LoginButton = styled(Button)`
  min-height: 3.5rem;
`;

export const Help = styled.span`
  text-align: right;
`;

function Login({ url, label, helpComponent }) {
  return (
    <Container maxWidth="sm">
      <a href={url}>
        <LoginButton
          id="dev-login-button"
          type="button"
          fullWidth
          variant="contained"
          color="primary"
        >
          {label}
        </LoginButton>
      </a>
      <Help>{helpComponent && helpComponent}</Help>
    </Container>
  );
}

Login.propTypes = {
  url: PropTypes.string,
  label: PropTypes.string.isRequired,
  helpComponent: PropTypes.node,
};

Login.defaultProps = {
  url: '',
  helpComponent: null,
};

export default Login;
