import React from 'react';
import styled from 'styled-components';
import Item from '@mui/material/ListItem';

import { Link as LinkComponent } from 'react-router-dom';

export const Link = styled(LinkComponent)`
  color: inherit;
  text-decoration: none;
`;

export const StyledListItem = styled(Item)``;

export const ListItem = styled(({ activeItem, ...rest }) => (
  <StyledListItem {...rest} />
))`
  ${(props) => props.activeItem && 'background-color: lightgray !important;'}
`;
