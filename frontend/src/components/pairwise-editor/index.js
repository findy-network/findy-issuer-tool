import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { Typography } from '@material-ui/core';
import DropDown from '../drop-down';

const Container = styled.div`
  margin-top: 1rem;
`;

const Content = styled.div`
  opacity: ${(props) => (props.visible ? '1' : '0')};
  display: ${(props) => (props.hidden ? 'none' : 'block')};
`;

const Description = styled.div`
  font-style: italic;
  margin-top: 0.5rem;
`;

const Header = styled(Typography)`
  margin-top: 1rem !important;
  font-weight: bold !important;
`;

function PairwiseEditor({
  children,
  connections,
  name,
  onSetName,
  title,
  description,
  contentHidden,
}) {
  return (
    <Container>
      <Header>{title}</Header>
      <Description>{description}</Description>
      <DropDown
        id="connection-selection"
        value={name}
        values={connections.map((item) => ({
          id: item.id,
          title: `${item.theirLabel} (${item.id})`,
        }))}
        onValueChange={onSetName}
        label={name ? 'Connection' : 'Select connection'}
      />
      <Content id="pairwise-content" visible={name} hidden={contentHidden}>
        {children}
      </Content>
    </Container>
  );
}

PairwiseEditor.propTypes = {
  connections: PropTypes.arrayOf(PropTypes.object).isRequired,
  children: PropTypes.node.isRequired,
  name: PropTypes.string.isRequired,
  onSetName: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  contentHidden: PropTypes.bool,
};

PairwiseEditor.defaultProps = {
  contentHidden: false,
};

export default PairwiseEditor;
