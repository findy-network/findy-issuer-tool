import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import WelcomeComponent from '../components/welcome';

function Welcome({ user }) {
  return <WelcomeComponent user={user} />;
}

Welcome.propTypes = {
  user: PropTypes.object.isRequired,
};

const mapStateToProps = ({ user }) => ({
  user,
});

export default connect(mapStateToProps)(Welcome);
