import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import configureStore from './store';

import App from './containers/app';
import Alert from './containers/alert';

const store = configureStore();

function Root() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <div>
          <Alert />
          <App />
        </div>
      </BrowserRouter>
    </Provider>
  );
}

const root = createRoot(document.getElementById('app'));
root.render(<Root />);
