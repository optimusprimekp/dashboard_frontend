import React from "react";
import Index from "../../Index";
const ActionButton = ({
  onClick,
  isDisabled,
  imgSRC,
  imgAlt,
  label,
  borderColor,
  bgColor,
  textColor,
  textSx = {},
  btnSx = {},
}) => {
  return (
    <Index.Button
      className=""
      sx={{
        bgcolor: bgColor,
        color: textColor,
        border: `1px solid ${borderColor}`,
        // minWidth: "20%",
        // maxWidth: "100%",
        ...btnSx,
      }}
      onClick={onClick}
      // disabled={disabledButtons["mainCommandPowerStopBtn"]}
      disabled={isDisabled}
    >
      {imgSRC && <img src={imgSRC} className="" alt={imgAlt} height={20} />}
      {label && (
        <Index.Typography
          sx={{
            textTransform: "none",
            marginLeft: "5px",
            fontSize: "12px",
            whiteSpace: "nowrap",
            ...textSx,
          }}
        >
          {label}
        </Index.Typography>
      )}
    </Index.Button>
  );
};

export default ActionButton;
