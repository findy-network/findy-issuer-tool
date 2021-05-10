import React from 'react';
import PropTypes from 'prop-types';

import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItemText from '@material-ui/core/ListItemText';

import { Link, ListItem } from './style';

const LinkItem = ({ path, activePath, label }) => (
  <Link to={path}>
    <ListItem button activeItem={path === activePath}>
      <ListItemText primary={label} />
    </ListItem>
  </Link>
);

LinkItem.propTypes = {
  path: PropTypes.string.isRequired,
  activePath: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
};

const NavMenu = (props) => (
  <Paper>
    <List>
      <LinkItem path="/" label="Events" {...props} />
      <LinkItem path="/connect" label="Connect" {...props} />
      <LinkItem path="/message" label="Message" {...props} />
      <LinkItem path="/issue" label="Issue" {...props} />
      <LinkItem path="/verify" label="Verify" {...props} />
      <LinkItem path="/tools" label="Tools" {...props} />
    </List>
  </Paper>
);

export default NavMenu;
