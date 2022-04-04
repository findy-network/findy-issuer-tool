import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import QRCodeComponent from 'qrcode.react';
import { walletURL } from '../../utils';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  details {
    min-width: 500px;
  }
  summary {
    p {
      display: inline-block;
    }
  }
`;

const Paragraph = styled(Typography)`
  width: 500px;
  padding-top: 20px;
  word-break: break-word;
`;

const QRCode = styled(QRCodeComponent)`
  margin: 20px 0;
  min-height: 200px;
`;

const Login = ({ invitation, status }) => {
  const statusComponent = () => {
    switch (status) {
      case 'connected':
      case 'issue':
        return (
          <Paragraph>
            Use your SSI wallet to complete the authentication and saving of the
            FTN credential.
          </Paragraph>
        );
      case 'ready_ok':
        return (
          <>
            <Paragraph>Authentication succeeded.</Paragraph>
            <Paragraph> You can now close this window.</Paragraph>
          </>
        );
      case 'done_ok':
        return (
          <>
            <Paragraph>Credential sending succeeded.</Paragraph>
            <Paragraph> You can now close this window.</Paragraph>
          </>
        );
      default:
        break;
    }
    return (
      <Paragraph>Something went wrong... Please contact support.</Paragraph>
    );
  };

  return (
    <div>
      <Container>
        <Paragraph variant="h3">FTN Credential Service</Paragraph>
        {!status || status === 'initialized' ? (
          <>
            <Paragraph>
              You can acquire FTN (Finnish Trust Network) credential to your SSI
              wallet using this service.
            </Paragraph>
            <Paragraph>
              To start, please read the QR code below with your{' '}
              <a href={walletURL} target="_blank" rel="noopener noreferrer">
                SSI wallet
              </a>
              .
            </Paragraph>
            {invitation && invitation.url && (
              <>
                <QRCode value={invitation.url} size={256} renderAs="svg" />

                <details>
                  <summary>
                    <Typography variant="caption">Show as text</Typography>
                  </summary>
                  <Paragraph variant="body2">{invitation.url}</Paragraph>
                </details>
              </>
            )}
          </>
        ) : (
          <div>{statusComponent()}</div>
        )}
      </Container>
    </div>
  );
};

Login.propTypes = {
  invitation: PropTypes.object,
  status: PropTypes.string,
};

Login.defaultProps = {
  invitation: null,
  status: null,
};

export default Login;
