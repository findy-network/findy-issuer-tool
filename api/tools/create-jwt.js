import config from 'config';
import jwt from 'jsonwebtoken';

const printToken = () => {
  const token = jwt.sign(
    { name: 'Tiina Tester', email: 'tiina.tester@example.com' },
    config.auth.jwtSharedSecret,
    { expiresIn: '10y' },
  );
  console.log(token);
};

printToken();
