import React, { useRef, useState } from "react";
import Index from "../../../../Index";
import PagesIndex from "../../../../PagesIndex";

export default function ChangePassword() {
  const formRef = useRef(null);
  const [buttonSpinner, setButtonSpinner] = useState(false);
  const initialValues = {
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  };
  const handleChangePassword = async (values) => {
    const payload = {
      oldPassword: values?.oldPassword,
      newPassword: values?.newPassword,
      confirmPassword: values?.confirmPassword,
    };
    setButtonSpinner(true);
    try {
      let res = await PagesIndex.apiPostHandler(
        PagesIndex.Api.CHANGE_PASSWORD,
        payload
      );
      setButtonSpinner(false);
      if (res.status) {
        formRef.current.resetForm();
        PagesIndex.toasterSuccess(res?.message);
      } else {
        PagesIndex.toasterError(res?.message);
      }
    } catch (error) {
      setButtonSpinner(false);
      console.log(error);
    }
  };
  return (
    <>
      <Index.Box className="admin-change-pass-main common-card">
        <Index.Typography
          className="admin-common-para admin-edit-highlight-text"
          component="p"
          variant="p"
        >
          Password
        </Index.Typography>
        <Index.Typography
          className="admin-common-para admin-edit-para-text"
          component="p"
          variant="p"
        >
          Enter your current & new password to reset your password
        </Index.Typography>
        <PagesIndex.Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={PagesIndex.changePasswordValidationSchema}
          onSubmit={handleChangePassword}
          innerRef={formRef}
        >
          {({
            values,
            errors,
            touched,
            setFieldValue,
            handleChange,
            handleSubmit,
          }) => (
            <PagesIndex.Form onSubmit={handleSubmit}>
              <Index.Box className="admin-input-box admin-change-pass-input-box">
                <Index.FormHelperText className="admin-form-lable">
                  Old Password
                </Index.FormHelperText>
                <Index.Box className="admin-form-group">
                  <Index.TextField
                    fullWidth
                    className="admin-form-control"
                    id="oldPassword"
                    name="oldPassword"
                    value={values?.oldPassword}
                    placeholder="Enter Old Password"
                    onChange={handleChange}
                  />

                  <Index.FormHelperText error>
                    {touched.oldPassword && errors.oldPassword
                      ? errors.oldPassword
                      : null}
                  </Index.FormHelperText>
                </Index.Box>
              </Index.Box>
              <Index.Box className="admin-input-box admin-change-pass-input-box">
                <Index.FormHelperText className="admin-form-lable">
                  New Password
                </Index.FormHelperText>
                <Index.Box className="admin-form-group">
                  <Index.TextField
                    fullWidth
                    className="admin-form-control"
                    id="newPassword"
                    name="newPassword"
                    value={values?.newPassword}
                    placeholder="Enter New Password"
                    onChange={handleChange}
                  />
                  <Index.FormHelperText error>
                    {touched.newPassword && errors.newPassword
                      ? errors.newPassword
                      : null}
                  </Index.FormHelperText>
                </Index.Box>
              </Index.Box>
              <Index.Box className="admin-input-box admin-change-pass-input-box">
                <Index.FormHelperText className="admin-form-lable">
                  Confirm Password
                </Index.FormHelperText>
                <Index.Box className="admin-form-group">
                  <Index.TextField
                    fullWidth
                    className="admin-form-control"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={values?.confirmPassword}
                    placeholder="Enter Confirm Password"
                    onChange={handleChange}
                  />
                  <Index.FormHelperText error>
                    {touched.confirmPassword && errors.confirmPassword
                      ? errors.confirmPassword
                      : null}
                  </Index.FormHelperText>
                </Index.Box>
              </Index.Box>
              <Index.Box className="admin-user-btn-flex admin-change-pass-flex">
                <Index.Box className="admin-discard-btn-main">
                  <PagesIndex.BorderButton
                    btnLabel="Discard"
                    className="admin-discard-user-btn border-btn"
                  />
                </Index.Box>
                <Index.Box className="admin-save-btn-main btn-main-primary">
                  <PagesIndex.PrimaryButton
                    type="submit"
                    className="admin-save-user-btn btn-primary"
                    btnLabel={
                      <>
                        {buttonSpinner ? (
                          <PagesIndex.Spinner />
                        ) : (
                          <>
                            <img
                              src={PagesIndex.Svg.save}
                              className="admin-user-save-icon"
                              alt="Save"
                            ></img>
                            <span>Save</span>
                          </>
                        )}
                      </>
                    }
                  />
                </Index.Box>
              </Index.Box>
            </PagesIndex.Form>
          )}
        </PagesIndex.Formik>
      </Index.Box>
    </>
  );
}
