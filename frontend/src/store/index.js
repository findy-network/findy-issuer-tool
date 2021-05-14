import { createBrowserHistory } from 'history';
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly';
import { applyMiddleware, createStore } from 'redux';
import { routerMiddleware } from 'connected-react-router';
import { createEpicMiddleware } from 'redux-observable';

import createRootReducer from './reducers';
import rootEpic from './epics';

const composeEnhancers = composeWithDevTools({});
export const history = createBrowserHistory();

const epicMiddleware = createEpicMiddleware();

export default () => {
  const store = createStore(
    createRootReducer(history),
    /* preloadedState, */
    composeEnhancers(applyMiddleware(routerMiddleware(history), epicMiddleware))
  );

  epicMiddleware.run(rootEpic);

  return store;
};
