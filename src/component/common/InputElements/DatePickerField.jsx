import Index from "../../../component/Index";
import PropTypes from "prop-types";
import { useState } from "react";

const DatePickerField = ({ name, label, value, onChange }) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <Index.Box>
      <Index.Typography className="form-control-label">
        {label}
      </Index.Typography>
      <Index.LocalizationProvider dateAdapter={Index.AdapterMoment}>
        <Index.DatePicker // This is the correct component for date-only
          label={label}
          value={value}
          name={name}
          className="admin-date-picker"
          format="DD/MM/YYYY" // This explicitly ensures no hours/minutes are displayed
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

DatePickerField.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]), // Keep this flexible
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  onChange: PropTypes.func,
};

export default DatePickerField;
