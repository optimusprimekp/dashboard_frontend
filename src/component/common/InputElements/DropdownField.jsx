import Index from "../../Index";
import PropTypes from "prop-types";

const DropdownField = ({ value, onChange, items, label }) => {
  return (
    <Index.Box>
      {label && (
        <Index.Typography className="form-control-label">
          {label}
        </Index.Typography>
      )}
      <Index.FormControl sx={{ width: "100%" }} size="small">
        <Index.InputLabel
          id="site-select-label"
          // className="form-control-label"
          shrink={false}
          sx={{
            color: "var(--secondary-color) !important", // Added !important to prevent color change
            fontSize: "12px",
            lineHeight: "20px",
            fontWeight: 400,
            display: value ? "none" : "block", // Hide label when value is selected
            transform: "translate(16px, 6px) scale(1)",
          }}
        >
          {`Select ${label}`}
        </Index.InputLabel>
        <Index.Select
          fullWidth
          className="form-control form-control-select"
          value={value}
          onChange={onChange}
          label="Site"
          labelId="site-select-label"
          sx={{
            "& .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
          }}
        >
          {items?.map((item) => (
            <Index.MenuItem
              key={item.id}
              value={item.id}
              className="form-control-select-item"
            >
              {item.label}
            </Index.MenuItem>
          ))}
        </Index.Select>
      </Index.FormControl>
    </Index.Box>
  );
};

DropdownField.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  label: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default DropdownField;
// color: "var(--secondary-color) !important", // Added !important to prevent color change
// fontSize: "12px",
// lineHeight: "20px",
// fontWeight: 400,
// display: value ? "none" : "block", // Hide label when value is selected
// transform: "translate(16px, 6px) scale(1)",
