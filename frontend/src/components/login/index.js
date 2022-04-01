import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';

import LoginComponent from '../gen-login';
import GitHubLogin from '../github-login';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100vh;
`;

const Login = ({ config }) => (
  <div>
    <Container>
      {CONFIG.auth.dev && config.dev && (
        <LoginComponent
          url={`${CONFIG.api.url}${config.dev.url}`}
          label="Dev login"
        />
      )}
      <GitHubLogin conf={config.github} />
      {config.findy && (
        <LoginComponent
          url={config.findy.url}
          label="Login via credential"
          helpComponent={
            <Link to="/login-credential">
              <Typography>No credential yet?</Typography>
            </Link>
          }
        />
      )}
    </Container>
  </div>
);

Login.propTypes = {
  config: PropTypes.object.isRequired,
};

export default Login;
