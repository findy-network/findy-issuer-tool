import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Routes, Route } from 'react-router-dom';

import CssBaseline from '@material-ui/core/CssBaseline';

import AppBar from '../components/app-bar';
import AppContainer from '../components/app-container';
import NoMatch from '../components/no-match';
import Connect from './connect';
import Welcome from './welcome';
import Events from './events';
import Issue from './issue';
import Login from './login';
import LoginCredential from './login-credential';
import Verify from './verify';
import Message from './message';
import Tools from './tools';
import Me from './me';
import { initApp } from '../store/actions';

function App({ user, doInitApp }) {
  useEffect(() => {
    if (!user) {
      doInitApp();
    }
  }, [user]);
  return (
    <div>
      {user && (
        <div>
          {user.email ? (
            <div>
              <CssBaseline />
              <AppBar userName={user.name} />
              <AppContainer>
                <Routes>
                  <Route path="/" element={<Welcome />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/connect" element={<Connect />} />
                  <Route path="/issue" element={<Issue />} />
                  <Route path="/verify" element={<Verify />} />
                  <Route path="/message" element={<Message />} />
                  <Route path="/tools" element={<Tools />} />
                  <Route path="/me" element={<Me />} />
                  <Route element={<NoMatch />} />
                </Routes>
              </AppContainer>
            </div>
          ) : (
            <Routes>
              <Route path="/login-credential" element={<LoginCredential />} />
              <Route path="*" element={<Login />} />
            </Routes>
          )}
        </div>
      )}
    </div>
  );
}

App.propTypes = {
  user: PropTypes.object,
  doInitApp: PropTypes.func.isRequired,
};

App.defaultProps = {
  user: null,
};

const mapStateToProps = ({ user }) => ({
  user,
});

const mapDispatchToProps = (dispatch) => ({
  doInitApp: () => dispatch(initApp()),
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
