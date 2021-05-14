import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';

import configureStore, { history } from './store';

import App from './containers/app';
import Alert from './containers/alert';

const store = configureStore();

const Root = () => (
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <div>
        <Alert />
        <App />
      </div>
    </ConnectedRouter>
  </Provider>
);

ReactDOM.render(<Root />, document.getElementById('app'));
