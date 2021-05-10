import React from 'react';
import PropTypes from 'prop-types';

import { Container, Content } from './style';
import Menu from '../nav-menu';

const AppContainer = ({ children, activePath }) => (
  <Container>
    <Menu activePath={activePath} />
    <Content>{children}</Content>{' '}
  </Container>
);

AppContainer.propTypes = {
  children: PropTypes.node.isRequired,
  activePath: PropTypes.string.isRequired,
};

export default AppContainer;
