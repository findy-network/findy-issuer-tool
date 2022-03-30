import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import styled from 'styled-components';

import { walletURL } from '../../utils';

const Paragraph = styled(Typography)`
  padding-top: 20px;
  padding-bottom: 5px;
`;

const Welcome = ({ user }) => (
  <>
    <Typography variant="h3">
      Welcome to Issuer Tool <strong>{user.name}</strong>!
    </Typography>
    <Paragraph>You can experiment with credentials using this tool.</Paragraph>
    <Paragraph>
      Start by creating a pairwise connection with a{' '}
      <a href={walletURL} target="_blank" rel="noopener noreferrer">
        wallet
      </a>{' '}
      user.
    </Paragraph>
    <div>
      <img
        alt="Usage instruction video"
        width="600px"
        src="https://github.com/findy-network/findy-issuer-tool/raw/master/docs/usage-03.gif"
      />
    </div>
    <Paragraph>
      See more instructions{' '}
      <a
        href="https://github.com/findy-network/findy-issuer-tool#usage"
        target="_blank"
        rel="noopener noreferrer"
      >
        here
      </a>
      .
    </Paragraph>
  </>
);

Welcome.propTypes = {
  user: PropTypes.object.isRequired,
};

export default Welcome;
