import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import LoginComponent from '../components/login';

function Login({ config }) {
  if (config) {
    return <LoginComponent config={config ? config.auth : {}} />;
  }
  return <div />;
}

const mapStateToProps = ({ config }) => ({
  config,
});

Login.propTypes = {
  config: PropTypes.object,
};

Login.defaultProps = {
  config: {},
};

export default connect(mapStateToProps)(Login);
