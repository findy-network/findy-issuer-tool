import React from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom-v5-compat';

import { Container, Content } from './style';
import Menu from '../nav-menu';

const AppContainer = ({ children }) => {
  const location = useLocation();
  return (
    <Container>
      <Menu activePath={location.pathname} />
      <Content>{children}</Content>{' '}
    </Container>
  );
};

AppContainer.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AppContainer;
