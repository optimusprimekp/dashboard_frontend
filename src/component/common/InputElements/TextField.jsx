import Index from "../../Index";
import React from "react";

const TextField = ({ label, value, onChange, placeholder }) => {
  return (
    <Index.Box>
      {label && (
        <Index.Typography className="form-control-label">
          {label}
        </Index.Typography>
      )}
      <Index.TextField
        fullWidth
        id="fullWidth"
        className="form-control-textfield"
        placeholder={placeholder ?? ""}
        value={value}
        onChange={onChange}
      />
    </Index.Box>
  );
};

export default TextField;
