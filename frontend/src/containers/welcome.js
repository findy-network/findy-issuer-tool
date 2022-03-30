import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import WelcomeComponent from '../components/welcome';

const Welcome = ({ user }) => <WelcomeComponent user={user} />;

Welcome.propTypes = {
  user: PropTypes.object.isRequired,
};

const mapStateToProps = ({ user }) => ({
  user,
});

export default connect(mapStateToProps)(Welcome);
