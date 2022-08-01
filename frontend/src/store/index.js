import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly';
import { applyMiddleware, createStore } from 'redux';
import { createEpicMiddleware } from 'redux-observable';

import createRootReducer from './reducers';
import rootEpic from './epics';

const composeEnhancers = composeWithDevTools({});

const epicMiddleware = createEpicMiddleware();

export default () => {
  const store = createStore(
    createRootReducer(),
    /* preloadedState, */
    composeEnhancers(applyMiddleware(epicMiddleware))
  );

  epicMiddleware.run(rootEpic);

  return store;
};
