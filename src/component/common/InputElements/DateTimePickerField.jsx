import Index from "../../../component/Index";
import PropTypes from "prop-types";
import { useState } from "react";
const DateTimePickerField = ({ name, label, value, onChange }) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <Index.Box>
      <Index.Typography className="form-control-label">
        {label}
      </Index.Typography>
      <Index.LocalizationProvider dateAdapter={Index.AdapterMoment}>
        <Index.DateTimePicker
          label={label}
          value={value}
          name={name}
          className="admin-date-picker"
          format="DD/MM/YYYY hh:mm:ss"
          slotProps={{
            textField: {
              onFocus: () => setIsFocused(true),
              onBlur: () => setIsFocused(false),
              InputLabelProps: {
                shrink: false,
                sx: {
                  color: "var(--secondary-color) !important",
                  fontSize: "12px",
                  lineHeight: "20px",
                  fontWeight: 400,
                  display: isFocused || value ? "none" : "block",
                  transform: "translate(16px, 6px) scale(1)",
                },
              },
            },
          }}
          onChange={onChange}
        />
      </Index.LocalizationProvider>
    </Index.Box>
  );
};

DateTimePickerField.propTypes = {
  value: PropTypes.string,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  onChange: PropTypes.func,
};

export default DateTimePickerField;
