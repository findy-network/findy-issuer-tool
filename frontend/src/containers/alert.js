import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Alert as AlertContainer } from '@mui/lab';
import styled from 'styled-components';

const AlertComponent = styled(AlertContainer)`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
`;

function Alert({ alert }) {
  return (
    <div>
      {alert && (
        <AlertComponent
          elevation={6}
          variant="filled"
          severity={alert.severity}
        >
          {`${alert.description} ${alert.reason ? `(${JSON.stringify(alert.reason)})` : ''
            }`}
        </AlertComponent>
      )}
    </div>
  );
}

Alert.propTypes = {
  alert: PropTypes.object,
};

Alert.defaultProps = {
  alert: null,
};

const mapStateToProps = ({ alert }) => ({
  alert,
});

export default connect(mapStateToProps)(Alert);
