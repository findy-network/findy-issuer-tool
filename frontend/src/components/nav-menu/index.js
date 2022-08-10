import React from 'react';
import PropTypes from 'prop-types';

import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItemText from '@material-ui/core/ListItemText';

import { Link, ListItem } from './style';

function LinkItem({ path, activePath, label, id }) {
  return (
    <Link to={path} id={id}>
      <ListItem button activeItem={path === activePath}>
        <ListItemText primary={label} />
      </ListItem>
    </Link>
  );
}

LinkItem.propTypes = {
  path: PropTypes.string.isRequired,
  activePath: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
};

function NavMenu(props) {
  return (
    <Paper>
      <List>
        <LinkItem
          id="events-link-item"
          path="/events"
          label="Events"
          {...props}
        />
        <LinkItem
          id="connect-link-item"
          path="/connect"
          label="Connect"
          {...props}
        />
        <LinkItem
          id="message-link-item"
          path="/message"
          label="Message"
          {...props}
        />
        <LinkItem id="issue-link-item" path="/issue" label="Issue" {...props} />
        <LinkItem
          id="verify-link-item"
          path="/verify"
          label="Verify"
          {...props}
        />
        <LinkItem id="tools-link-item" path="/tools" label="Tools" {...props} />
        <LinkItem
          id="my-creds-link-item"
          path="/me"
          label="My creds"
          {...props}
        />
      </List>
    </Paper>
  );
}

export default NavMenu;
