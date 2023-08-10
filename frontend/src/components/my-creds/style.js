import styled from 'styled-components';
import { Typography, Button as BaseButton } from '@mui/material';

export const Header = styled(Typography)`
  margin: 1rem 0 !important;
  font-weight: bold !important;
  font-size: 1.3rem !important;
`;

export const ButtonContainer = styled.div`
  margin-bottom: 1rem;
  text-align: right;
`;

export const Button = styled(BaseButton)`
  ${(props) => !props.disabled && `display: inline-block;`}
`;

export const Section = styled.div`
  border-top: 1px solid #e0e0e0;
  margin-bottom: 3rem;
`;
