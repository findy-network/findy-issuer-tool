import React from 'react';
import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import { Container, ButtonImage, ExternalLink } from './style';

import ghLogo from '../../../assets/GitHub-Mark-Light-120px-plus.png';

function Login({ conf }) {
  return (
    <Container maxWidth="sm">
      <ExternalLink href={conf.url}>
        <Button type="button" fullWidth variant="contained" color="primary">
          <ButtonImage src={ghLogo} alt="Login with GitHub account" />
          Log In
        </Button>
      </ExternalLink>
    </Container>
  );
}

Login.propTypes = {
  conf: PropTypes.object,
};

Login.defaultProps = {
  conf: {},
};

export default Login;
