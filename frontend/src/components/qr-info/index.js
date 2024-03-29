import React from 'react';
import PropTypes from 'prop-types';
import QRCode from 'qrcode.react';
import styled from 'styled-components';

import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

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

function QRInfo({ value, title }) {
  return (
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
        <QRCode value={value} size={256} renderAs="svg" />
      </CodeContainer>
    </div>
  );
}

QRInfo.propTypes = {
  value: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};

export default QRInfo;
