import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import LoginCredential from '../components/login-credential';

const Login = ({ config }) => <LoginCredential />;

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
