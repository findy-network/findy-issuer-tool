import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { fetchEventsLog } from '../store/actions';
import EventLog from '../components/event-log';

const Events = ({ doFetchEventsLog, events }) => {
  const [updated, setUpdated] = useState(false);
  useEffect(() => {
    if (!updated) {
      doFetchEventsLog();
      setUpdated(true);
    }
  });
  return <EventLog events={events} />;
};

Events.propTypes = {
  doFetchEventsLog: PropTypes.func.isRequired,
  events: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const mapStateToProps = ({ events: { log } }) => ({
  events: log,
});

const mapDispatchToProps = (dispatch) => ({
  doFetchEventsLog: () => dispatch(fetchEventsLog()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Events);
