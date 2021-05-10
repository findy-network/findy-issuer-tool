import React from 'react';
import styled from 'styled-components';

import GitHubLogin from '../github-login';

const Container = styled.div`
  display: flex;
  justify-content: center;
`;

const Login = () => {
  return (
    <div>
      <Container>
        <GitHubLogin />
      </Container>
    </div>
  );
};

export default Login;
