import React from 'react';
import PropTypes from 'prop-types';
import QRCode from 'qrcode.react';
import styled from 'styled-components';

import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

const LinkContainer = styled(Typography)`
  text-align: center;
  margin: 1rem 0;
`;

const TextContainer = styled(Paper)`
  max-width: 30rem;
  margin-top: 1rem;
  word-break: break-word;
  padding: 1rem;
`;

const CodeContainer = styled.div`
  display: flex;
  margin: 1rem 0;
  justify-content: center;
`;

const QRInfo = ({ value, title }) => (
  <div>
    <Typography>{title}</Typography>
    <TextContainer id="invitation-raw">{value}</TextContainer>
    {Object.keys(CONFIG.wallets).map((key) => {
      const item = CONFIG.wallets[key];
      return (
        <LinkContainer key={item.label}>
          <a
            href={`${item.url}${btoa(encodeURIComponent(value))}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in {item.label}
          </a>
        </LinkContainer>
      );
    })}
    <CodeContainer>
      <QRCode value={value} />
    </CodeContainer>
  </div>
);

QRInfo.propTypes = {
  value: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};

export default QRInfo;
