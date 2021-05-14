import config from 'config';
import jwt from 'jsonwebtoken';

import github from './github';
import dev from './dev';

export default (storage) => {
  const { addOrUpdateUser } = storage;

  const createToken = async (name, email) => {
    await addOrUpdateUser({ name, email });
    return jwt.sign({ name, email }, config.auth.jwtSharedSecret, {
      expiresIn: '24h',
    });
  };

  return {
    ...github(createToken),
    ...dev(createToken),
  };
};
