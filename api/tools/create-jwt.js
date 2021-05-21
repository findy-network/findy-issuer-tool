import jwt from 'jsonwebtoken';

import conf from '../src/config';

const printToken = async () => {
  const { config } = await conf();

  const token = jwt.sign(
    { name: 'Tiina Tester', email: 'tiina.tester@example.com' },
    config.auth.jwtSharedSecret,
    { expiresIn: '10y' },
  );
  console.log(token);
};

printToken();
