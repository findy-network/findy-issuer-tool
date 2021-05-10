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

const DropDown = ({ label, value, onValueChange, values }) => {
  const selectValues = values.map((item) =>
    item.id ? item : { id: item, title: item }
  );

  return (
    <div>
      <FormControl variant="outlined">
        <InputLabel htmlFor="outlined-age-native-simple">{label}</InputLabel>
        <Select
          native
          value={value}
          label={label}
          onChange={({ target: { value: selection } }) =>
            onValueChange(selection)
          }
          inputProps={{
            name: 'age',
            id: 'outlined-age-native-simple',
          }}
        >
          {/* eslint-disable-next-line */}
          <option key="0" value="" />
          {selectValues.map(({ id, title }) => (
            <option key={id} value={id}>
              {title}
            </option>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

DropDown.propTypes = {
  value: PropTypes.string,
  onValueChange: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  values: PropTypes.arrayOf(PropTypes.object).isRequired,
};

DropDown.defaultProps = {
  value: '',
};

export default DropDown;
