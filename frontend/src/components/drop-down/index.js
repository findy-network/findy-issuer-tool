import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import FormControlComponent from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';

const FormControl = styled(FormControlComponent)`
  margin: 1rem 0 !important;
  width: 100%;
`;

function DropDown({ label, value, onValueChange, values, id }) {
  const selectValues = values.map((item) =>
    item.id ? item : { id: item, title: item },
  );

  return (
    <div>
      <FormControl variant="outlined">
        <InputLabel htmlFor={id}>{label}</InputLabel>
        <Select
          id={id}
          native
          value={value}
          label={label}
          onChange={({ target: { value: selection } }) =>
            onValueChange(selection)
          }
          inputProps={{
            name: 'age',
            id,
          }}
        >
          {/* eslint-disable-next-line */}
          <option key="0" value="" />
          {selectValues.map(({ id: valueId, title }) => (
            <option id={valueId} key={valueId} value={valueId}>
              {title}
            </option>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}

DropDown.propTypes = {
  value: PropTypes.string,
  onValueChange: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  values: PropTypes.arrayOf(PropTypes.object).isRequired,
  id: PropTypes.string.isRequired,
};

DropDown.defaultProps = {
  value: '',
};

export default DropDown;
