import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import LoginComponent from '../components/login';

const Login = ({ config }) => {
  if (config) {
    return <LoginComponent config={config ? config.auth : {}} />;
  }
  return <></>;
};

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
