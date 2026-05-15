import React from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";

export default function Otp() {
  const [otp, setOtp] = React.useState("");

  const handleChange = (newValue) => {
    setOtp(newValue);
  };
  return (
    <div>
      <Index.Box className="admin-auth-main-flex">
        <Index.Box className="admin-auth-left-main">
          <PagesIndex.AuthBackground />
        </Index.Box>
        <Index.Box className="admin-auth-right-main">
          <Index.Box className="admin-auth-box">
            <Index.Box className="admin-auth-main">
              <Index.Box className="admin-auth-inner-main admin-otp-inner-main">
                <Index.Typography
                  component="h2"
                  variant="h2"
                  className="admin-wel-text"
                >
                  Otp!
                </Index.Typography>
                <Index.Typography
                  component="p"
                  variant="p"
                  className="admin-sign-para admin-common-para"
                >
                  Please enter your credentials to Otp!
                </Index.Typography>
                <Index.Box className="admin-otp-flex-main">
                  <Index.Box className="admin-otp-input-box">
                    <Index.Box className="admin-form-group">
                      <Index.MuiOtpInput
                        value={otp}
                        onChange={handleChange}
                        className="admin-form-control"
                      />
                    </Index.Box>
                  </Index.Box>
                </Index.Box>
                <Index.Box className="admin-flex-all admin-forgot-row">
                  <Index.Link
                    className="admin-forgot-para admin-common-para"
                    to="/login"
                  >
                    Back to Login?
                  </Index.Link>
                </Index.Box>
                <Index.Box className="btn-main-primary admin-login-btn-main">
                  <Index.Button className="btn-primary admin-login-btn">
                    Send
                  </Index.Button>
                </Index.Box>
              </Index.Box>
            </Index.Box>
          </Index.Box>
        </Index.Box>
      </Index.Box>
    </div>
  );
}
