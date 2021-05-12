import React from 'react';
import styled from 'styled-components';
import MUIContainer from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';

export const Container = styled(MUIContainer)``;

export const LoginButton = styled(Button)`
  min-height: 3.5rem;
`;

const Login = () => (
  <Container maxWidth="sm">
    <a href={`${CONFIG.api.url}/auth/dev`}>
      <LoginButton type="button" fullWidth variant="contained" color="primary">
        Dev login
      </LoginButton>
    </a>
  </Container>
);

export default Login;
