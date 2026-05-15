import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import { useNavigate } from "react-router-dom";

// for custom checkbox design

const BpIcon = styled("span")(({ theme }) => ({
  borderRadius: 0,
  border: "1px solid #114A65",
  width: 16,
  height: 16,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  boxShadow: "none",
  backgroundColor: theme.palette.mode === "dark" ? "#394b59" : "transparent",
}));

const BpCheckedIcon = styled(BpIcon)({
  backgroundColor: "transparent",
  "&:before": {
    display: "block",
    width: 12,
    height: 12,
    backgroundImage:
      "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath" +
      " fill-rule='evenodd' clip-rule='evenodd' d='M12 5c-.28 0-.53.11-.71.29L7 9.59l-2.29-2.3a1.003 " +
      "1.003 0 00-1.42 1.42l3 3c.18.18.43.29.71.29s.53-.11.71-.29l5-5A1.003 1.003 0 0012 5z' fill='%23114A65'/%3E%3C/svg%3E\")",
    content: '""',
  },
  "input:hover ~ &": {
    backgroundColor: "transparent",
  },
});

// Inspired by blueprintjs
function BpCheckbox(props) {
  return (
    <Index.Checkbox
      sx={{
        "&:hover": { bgcolor: "transparent" },
      }}
      disableRipple
      color="default"
      checkedIcon={<BpCheckedIcon />}
      icon={<BpIcon />}
      inputProps={{ "aria-label": "Checkbox demo" }}
      {...props}
    />
  );
}

export default function ForgotPassword() {
  const navigate = useNavigate();
  const initialValues = {
    email: "",
  };
  // for password eye hide and show

  const [buttonSpinner, setButtonSpinner] = useState(false);

  const handleSubmit = async (values) => {
    const urlencoded = new URLSearchParams();
    urlencoded.append("email", values?.email.toLowerCase());

    setButtonSpinner(true);
    try {
      const res = await PagesIndex.apiPostHandler(
        PagesIndex.Api.FORGOT_PASSWORD,
        urlencoded
      );
      setButtonSpinner(false);
      if (res.status && res.status !== 404) {
        navigate("/");
        PagesIndex.toasterSuccess(res?.message);
      } else {
        PagesIndex.toasterError(res?.message);
        setButtonSpinner(false);
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      <Index.Box className="admin-auth-main-flex">
        <Index.Box className="admin-auth-box">
          <Index.Box className="admin-auth-main">
            <Index.Box className="admin-auth-inner-main admin-login-inner-main">
              <Index.Box className="admin-auth-logo-box">
                <img
                  src={PagesIndex.Png.logoSmall}
                  alt="Logo"
                  className="admin-auth-logo"
                />
              </Index.Box>
              <Index.Typography
                component="h2"
                variant="h2"
                className="admin-wel-text"
              >
                Forgot Password!
              </Index.Typography>
              <Index.Typography
                component="p"
                variant="p"
                className="admin-sign-para admin-common-para"
              >
                Please enter your credentials to reset password!
              </Index.Typography>
              <PagesIndex.Formik
                enableReinitialize
                initialValues={initialValues}
                validationSchema={PagesIndex.forgotPasswordSchema}
                onSubmit={handleSubmit}
              >
                {({ values, errors, touched, handleChange, handleSubmit }) => (
                  <PagesIndex.Form onSubmit={handleSubmit}>
                    <Index.Box className="admin-input-box">
                      <Index.FormHelperText className="admin-form-lable">
                        Email
                      </Index.FormHelperText>
                      <Index.Box className="admin-form-group">
                        <Index.TextField
                          fullWidth
                          className="admin-form-control"
                          placeholder="Please enter email"
                          autoComplete="off"
                          name="email"
                          id="email"
                          onChange={handleChange}
                          value={values.email}
                          inputProps={{ maxLength: 50 }}
                        />
                        <Index.FormHelperText error>
                          {errors?.email && touched?.email
                            ? errors?.email
                            : null}
                        </Index.FormHelperText>
                      </Index.Box>
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
    </>
  );
}
