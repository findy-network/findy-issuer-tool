import React from 'react';

import AppBarComponent from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

const AppBar = () => (
  <AppBarComponent position="relative">
    <Toolbar>
      <Typography variant="h6" noWrap>
        Issuer Tool
      </Typography>
    </Toolbar>
  </AppBarComponent>
);

export default AppBar;
