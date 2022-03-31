import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router';

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

const App = ({ user, activePath }) => (
  <div>
    {user && (
      <div>
        {user.email ? (
          <div>
            <CssBaseline />
            <AppBar userName={user.name} />
            <AppContainer activePath={activePath}>
              <Switch>
                <Route exact path="/" component={Welcome} />
                <Route exact path="/events" component={Events} />
                <Route exact path="/connect" component={Connect} />
                <Route exact path="/issue" component={Issue} />
                <Route exact path="/verify" component={Verify} />
                <Route exact path="/message" component={Message} />
                <Route path="/tools" component={Tools} />
                <Route path="/me" component={Me} />
                <Route component={NoMatch} />
              </Switch>
            </AppContainer>
          </div>
        ) : (
          <Switch>
            <Route exact path="/login-credential" component={LoginCredential} />
            <Route exact path="/" component={Login} />
            <Route component={Login} />
          </Switch>
        )}
      </div>
    )}
  </div>
);

App.propTypes = {
  user: PropTypes.object,
  activePath: PropTypes.string.isRequired,
};

App.defaultProps = {
  user: null,
};

const mapStateToProps = ({
  user,
  router: {
    location: { pathname },
  },
}) => ({
  user,
  activePath: pathname,
});

export default connect(mapStateToProps)(App);
