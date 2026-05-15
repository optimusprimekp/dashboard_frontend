import Index from "../../Index";
import React from "react";

const DetailsField = ({ label, text, sx = {}, children }) => {
  return (
    <Index.Box
      sx={{
        // minWidth: "100px",
        display: "flex",
        border: "1px solid #e6ebf5",
        flex: "1",
        alignItems: "center",
        height: "100%",
        ...sx,
      }}
      className="details-field"
    >
      <Index.Typography
        sx={{
          height: "100%",
          bgcolor: "#fafafa",
          padding: "10px 20px 10px 5px",
          borderRight: "1px solid #e6ebf5",
          color: "#909399",
          fontWeight: "300",
          fontSize: "14px",
          minWidth: { lg: "180px", xs: "100px", sm: "130px" },
          maxWidth: { lg: "180px", xs: "100px", sm: "130px" },
          // whiteSpace: "nowrap",
        }}
      >
        {label}
      </Index.Typography>
      <Index.Typography
        sx={{
          padding: "10px 20px 10px 5px",
          fontWeight: "300",
          fontSize: "14px",
          display: "flex",
          alignItems: "center",
          gap: "5px",
          // alignSelf: "center",
          // whiteSpace: "nowrap",
        }}
      >
        {text}
        {children}
      </Index.Typography>
    </Index.Box>
  );
};
export default DetailsField;
