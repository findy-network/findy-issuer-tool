import React from 'react';

import Button from '@material-ui/core/Button';
import { Container, ButtonImage, ExternalLink } from './style';

import ghLogo from '../../../assets/GitHub-Mark-Light-120px-plus.png';

const Login = () => (
  <Container maxWidth="sm">
    <ExternalLink
      href={`https://github.com/login/oauth/authorize?scope=user:email&amp;client_id=${CONFIG.auth.github.clientId}`}
    >
      <Button type="button" fullWidth variant="contained" color="primary">
        <ButtonImage src={ghLogo} alt="Login with GitHub account" />
        Log In
      </Button>
    </ExternalLink>
  </Container>
);

export default Login;
