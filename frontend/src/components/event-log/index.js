import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import PaperComponent from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

const Paper = styled(PaperComponent)`
  display: flex;
  flex-wrap: wrap;
  padding: 0.5rem;
  word-break: break-all;
`;

const Cell = styled.div`
  padding: 0 1rem;
  :not(:last-child) {
    border-right: 1px solid gray;
  }
  :not(:first-child) {
    min-width: 17rem;
  }
`;

const Header = styled(Typography)`
  margin: 0.5rem;
`;

function EventLog({ events }) {
  return (
    <div>
      {events.length === 0 ? (
        <div>No events recorded yet.</div>
      ) : (
        <Header>Latest messages received from agency:</Header>
      )}
      {events
        .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))
        .map((item) => (
          <Paper key={item.timestamp}>
            <Cell>{new Date(item.timestamp).toLocaleString()}</Cell>
            <Cell>{item.payload.type}</Cell>
            <Cell>{item.payload.protocol}</Cell>
            <Cell>{item.payload.status}</Cell>
          </Paper>
        ))}
    </div>
  );
}

EventLog.propTypes = {
  events: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default EventLog;
