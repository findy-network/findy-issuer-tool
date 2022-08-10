import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import BaseButton from '@material-ui/core/Button';

const ButtonContainer = styled.div`
  margin-bottom: 1rem;
  text-align: right;
`;

const Button = styled(BaseButton)`
  ${(props) => !props.disabled && `display: inline-block;`}
`;

function EditorButtons({ canReset, onReset, canSave, onSave, okLabel, id }) {
  return (
    <ButtonContainer>
      <Button disabled={!canReset} onClick={onReset}>
        Reset
      </Button>
      <Button disabled={!canSave} onClick={onSave} id={`${id}-save-button`}>
        {okLabel || 'Save'}
      </Button>
    </ButtonContainer>
  );
}

EditorButtons.propTypes = {
  canReset: PropTypes.bool.isRequired,
  canSave: PropTypes.bool.isRequired,
  onReset: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  okLabel: PropTypes.string,
  id: PropTypes.string.isRequired,
};

EditorButtons.defaultProps = {
  okLabel: null,
};

export default EditorButtons;
