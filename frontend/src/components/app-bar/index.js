import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

import AppBarComponent from '@material-ui/core/AppBar';
import ToolbarComponent from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { Button } from '@material-ui/core';

const Toolbar = styled(ToolbarComponent)`
  display: flex;
  justify-content: space-between;
`;

const AppBar = ({ userName }) => (
  <AppBarComponent position="relative">
    <Toolbar>
      <Typography variant="h6" noWrap>
        Issuer Tool
      </Typography>
      <Button
        title="Logout"
        onClick={() => {
          localStorage.setItem('token', null);
          window.location.reload();
        }}
      >
        {userName}
      </Button>
    </Toolbar>
  </AppBarComponent>
);

AppBar.propTypes = {
  userName: PropTypes.string.isRequired,
};

export default AppBar;
