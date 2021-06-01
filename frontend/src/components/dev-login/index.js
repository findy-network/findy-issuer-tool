import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import MUIContainer from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';

export const Container = styled(MUIContainer)``;

export const LoginButton = styled(Button)`
  min-height: 3.5rem;
`;

const Login = ({ conf }) => (
  <Container maxWidth="sm">
    <a href={`${CONFIG.api.url}${conf.url}`}>
      <LoginButton type="button" fullWidth variant="contained" color="primary">
        Dev login
      </LoginButton>
    </a>
  </Container>
);

Login.propTypes = {
  conf: PropTypes.object,
};

Login.defaultProps = {
  conf: {},
};

export default Login;
