import jwt from 'jsonwebtoken';

import github from './github';
import dev from './dev';

export default (storage, config) => {
  const { addOrUpdateUser } = storage;

  const createToken = async (name, email, id) => {
    await addOrUpdateUser({ name, email, id: id.toString() });
    return jwt.sign({ name, email }, config.auth.jwtSharedSecret, {
      expiresIn: '24h',
    });
  };

  return {
    ...github(createToken, config),
    ...dev(createToken, config),
  };
};
