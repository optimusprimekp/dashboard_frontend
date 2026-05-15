import React, { useState } from "react";
import Index from "../../../Index.jsx";
import PagesIndex from "../../../PagesIndex.jsx"; // Assuming PagesIndex exports useParams, useNavigate, useLocation, Formik, Form, etc.
import { useParams } from "react-router-dom";

export default function ResetPassword() {
  const initialValues = {
    newPassword: "",
    confirmNewPassword: "",
  };

  const navigate = PagesIndex.useNavigate();
  const { token } = useParams(); // Get token from URL parameters

  const [buttonSpinner, setButtonSpinner] = useState(false);

  // for password eye hide and show for New Password
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const handleClickShowNewPassword = () => setShowNewPassword((show) => !show);
  const handleMouseDownNewPassword = (event) => {
    event.preventDefault();
  };

  // for password eye hide and show for Confirm New Password
  const [showConfirmNewPassword, setShowConfirmNewPassword] =
    React.useState(false);
  const handleClickShowConfirmNewPassword = () =>
    setShowConfirmNewPassword((show) => !show);
  const handleMouseDownConfirmNewPassword = (event) => {
    event.preventDefault();
  };

  const handleChangePassword = async (values) => {
    console.log("Reset Password values", values);
    if (!token) {
      PagesIndex.toasterError("Reset token is missing or invalid.");
      return;
    }

    if (values.newPassword !== values.confirmNewPassword) {
      PagesIndex.toasterError(
        "New Password and Confirm New Password do not match."
      );
      return;
    }

    const urlencoded = new URLSearchParams();
    urlencoded.append("token", token); // Send the token obtained from URL params
    urlencoded.append("newPassword", values?.newPassword);
    urlencoded.append("confirmNewPassword", values?.confirmNewPassword);
    setButtonSpinner(true);
    try {
      let res = await PagesIndex.apiPostHandler(
        PagesIndex.Api.RESET_PASSWORD,
        urlencoded
      );
      setButtonSpinner(false);
      if (res.status == 200) {
        navigate("/");
        PagesIndex.toasterSuccess(res?.message);
      } else {
        PagesIndex.toasterError(res?.message);
      }
    } catch (error) {
      setButtonSpinner(false);
      console.log(error);
      PagesIndex.toasterError("An error occurred during password reset.");
    }
  };

  return (
    <div>
      <Index.Box className="admin-auth-main-flex">
        <Index.Box className="admin-auth-right-main">
          <Index.Box className="admin-auth-box">
            <Index.Box className="admin-auth-main">
              <Index.Box className="admin-auth-inner-main admin-forgot-pass-inner-main">
                <Index.Typography
                  component="h2"
                  variant="h2"
                  className="admin-wel-text"
                >
                  Reset Password!
                </Index.Typography>
                <Index.Typography
                  component="p"
                  variant="p"
                  className="admin-sign-para admin-common-para"
                >
                  Please enter your new password and confirm it!
                </Index.Typography>
                <PagesIndex.Formik
                  enableReinitialize
                  initialValues={initialValues}
                  validationSchema={PagesIndex.resetPasswordValidationSchema} // Ensure this schema validates both newPassword and confirmNewPassword
                  onSubmit={handleChangePassword}
                >
                  {({
                    values,
                    errors,
                    touched,
                    handleChange,
                    handleSubmit,
                  }) => (
                    <PagesIndex.Form onSubmit={handleSubmit}>
                      {/* New Password Input */}
                      <Index.Box className="admin-input-box">
                        <Index.FormHelperText className="admin-form-lable">
                          New Password
                        </Index.FormHelperText>
                        <Index.Box className="admin-form-group">
                          <Index.OutlinedInput
                            className="admin-form-control-eye admin-form-control"
                            autoComplete="new-password" // Suggest modern browser auto-fill
                            name="newPassword"
                            id="newPassword"
                            onChange={handleChange}
                            value={values.newPassword}
                            inputProps={{ maxLength: 50 }}
                            type={showNewPassword ? "text" : "password"}
                            endAdornment={
                              <Index.InputAdornment position="end">
                                <Index.IconButton
                                  aria-label="toggle new password visibility"
                                  onClick={handleClickShowNewPassword}
                                  onMouseDown={handleMouseDownNewPassword}
                                  edge="end"
                                >
                                  {showNewPassword ? (
                                    <Index.VisibilityOff />
                                  ) : (
                                    <Index.Visibility />
                                  )}
                                </Index.IconButton>
                              </Index.InputAdornment>
                            }
                          />
                          <Index.FormHelperText error>
                            {errors?.newPassword && touched?.newPassword
                              ? errors?.newPassword
                              : null}
                          </Index.FormHelperText>
                        </Index.Box>
                      </Index.Box>

                      {/* Confirm New Password Input */}
                      <Index.Box className="admin-input-box">
                        <Index.FormHelperText className="admin-form-lable">
                          Confirm New Password
                        </Index.FormHelperText>
                        <Index.Box className="admin-form-group">
                          <Index.OutlinedInput
                            className="admin-form-control-eye admin-form-control"
                            autoComplete="new-password" // Suggest modern browser auto-fill
                            name="confirmNewPassword"
                            id="confirmNewPassword"
                            onChange={handleChange}
                            value={values.confirmNewPassword}
                            inputProps={{ maxLength: 50 }}
                            type={showConfirmNewPassword ? "text" : "password"}
                            endAdornment={
                              <Index.InputAdornment position="end">
                                <Index.IconButton
                                  aria-label="toggle confirm new password visibility"
                                  onClick={handleClickShowConfirmNewPassword}
                                  onMouseDown={
                                    handleMouseDownConfirmNewPassword
                                  }
                                  edge="end"
                                >
                                  {showConfirmNewPassword ? (
                                    <Index.VisibilityOff />
                                  ) : (
                                    <Index.Visibility />
                                  )}
                                </Index.IconButton>
                              </Index.InputAdornment>
                            }
                          />
                          <Index.FormHelperText error>
                            {errors?.confirmNewPassword &&
                            touched?.confirmNewPassword
                              ? errors?.confirmNewPassword
                              : null}
                          </Index.FormHelperText>
                        </Index.Box>
                      </Index.Box>

                      <Index.Box className="admin-flex-all admin-forgot-row">
                        <Index.Link
                          className="admin-forgot-para admin-common-para"
                          to="/"
                        >
                          Back to Login?
                        </Index.Link>
                      </Index.Box>
                      <Index.Box className="btn-main-primary admin-login-btn-main">
                        <PagesIndex.PrimaryButton
                          type="submit"
                          className="btn-primary admin-login-btn"
                          btnLabel={
                            <>
                              {buttonSpinner ? (
                                <PagesIndex.Spinner />
                              ) : (
                                <span>Submit</span>
                              )}
                            </>
                          }
                        />
                      </Index.Box>
                    </PagesIndex.Form>
                  )}
                </PagesIndex.Formik>
              </Index.Box>
            </Index.Box>
          </Index.Box>
        </Index.Box>
      </Index.Box>
    </div>
  );
}
