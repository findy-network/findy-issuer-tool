import React from 'react';
import PropTypes from 'prop-types';

function LedgerLink({ value, txnType, id }) {
  return (
    <a
      id={id}
      href={`${
        CONFIG.ledger.browserUrl
      }/browse/domain?page=1&query=${encodeURIComponent(
        value
      )}&txn_type=${txnType}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      {` ${value}`}
    </a>
  );
}

LedgerLink.propTypes = {
  value: PropTypes.string.isRequired,
  txnType: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
};

export default LedgerLink;
