import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  p {
    width: 500px;
    padding-top: 20px;
  }
`;

const walletURL = CONFIG.wallets.findy.url.substring(
  0,
  CONFIG.wallets.findy.url.lastIndexOf(
    '/',
    CONFIG.wallets.findy.url.length - 2
  ) + 1
);

const Login = ({ config }) => (
  <div>
    <Container>
      <Typography variant="h3">FTN Credential Service</Typography>
      <Typography>
        You can acquire FTN (Finnish Trust Network) credential to your SSI
        wallet using this service.
      </Typography>
      <Typography>
        To start, please read the QR code below with your{' '}
        <a href={walletURL} target="_blank" rel="noopener noreferrer">
          SSI wallet
        </a>
        .
      </Typography>
      <div>qr code here</div>
    </Container>
  </div>
);

Login.propTypes = {
  config: PropTypes.object.isRequired,
};

export default Login;
