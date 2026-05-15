import React from "react";
import Index from "../../Index";
import PagesIndex from "../../PagesIndex";

const SearchField = ({ value, onChange, label, placeholder }) => {
  return (
    <Index.Box>
      {label && (
        <Index.Typography className="form-control-label">
          {label}
        </Index.Typography>
      )}
      <Index.Box className="icon-form-field-container">
        <img
          src={PagesIndex.Svg.search}
          className="form-field-icon"
          alt="search"
        ></img>
        <Index.TextField
          fullWidth
          id="fullWidth"
          className="form-control-input form-control"
          placeholder={placeholder ?? "Search"}
          value={value}
          onChange={onChange}
        />
      </Index.Box>
    </Index.Box>
  );
};

export default SearchField;
