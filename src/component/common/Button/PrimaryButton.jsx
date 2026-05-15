import React from "react";
import Index from "../../Index";

export default function PrimaryButton({
  className,
  type = "button",
  onClick,
  btnLabel,
}) {
  return (
    <Index.Box className="admin-save-btn-main btn-main-primary">
      <Index.Button className={className} type={type} onClick={onClick}>
        {btnLabel}
      </Index.Button>
    </Index.Box>
  );
}
