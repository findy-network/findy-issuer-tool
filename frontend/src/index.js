import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import configureStore from './store';

import App from './containers/app';
import Alert from './containers/alert';

const store = configureStore();

const Root = () => (
  <Provider store={store}>
    <BrowserRouter>
      <div>
        <Alert />
        <App />
      </div>
    </BrowserRouter>
  </Provider>
);

ReactDOM.render(<Root />, document.getElementById('app'));
