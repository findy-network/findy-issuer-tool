import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Typography from '@mui/material/Typography';

import LoginComponent from '../gen-login';
import GitHubLogin from '../github-login';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100vh;
`;

function Login({ config }) {
  return (
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
              <a
                href="/login-credential"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Typography>No credential yet?</Typography>
              </a>
            }
          />
        )}
      </Container>
    </div>
  );
}

Login.propTypes = {
  config: PropTypes.object.isRequired,
};

export default Login;
