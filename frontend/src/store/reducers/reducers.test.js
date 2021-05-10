import { user as reducer } from './index';
import initialState from './initial-state';

describe('user', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState.user);
  });
});
