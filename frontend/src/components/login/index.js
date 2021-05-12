import React from 'react';
import styled from 'styled-components';

import DevLogin from '../dev-login';
import GitHubLogin from '../github-login';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100vh;
`;

const Login = () => (
  <div>
    <Container>
      {CONFIG.auth.dev && <DevLogin />}
      <GitHubLogin />
    </Container>
  </div>
);

export default Login;
