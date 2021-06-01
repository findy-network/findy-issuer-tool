import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import DevLogin from '../dev-login';
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
      {CONFIG.auth.dev && <DevLogin conf={config.dev} />}
      <GitHubLogin conf={config.github} />
    </Container>
  </div>
);

Login.propTypes = {
  config: PropTypes.object.isRequired,
};

export default Login;
