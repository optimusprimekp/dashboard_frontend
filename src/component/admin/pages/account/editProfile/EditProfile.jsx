import React, { useContext, useState, useEffect } from "react";
import Index from "../../../../Index";
import PagesIndex from "../../../../PagesIndex";

// Custom Switch Design (unchanged)
const IOSSwitch = Index.styled((props) => (
  <Index.Switch
    focusVisibleClassName=".Mui-focusVisible"
    disableRipple
    {...props}
  />
))(({ theme }) => ({
  width: 34,
  height: 20,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 3,
    transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(16px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: theme.palette.mode === "dark" ? "#2ECA45" : "#114A65",
        opacity: 1,
        border: 0,
      },
      "&.Mui-disabled + .MuiSwitch-track": {
        opacity: 0.5,
      },
    },
    "&.Mui-focusVisible .MuiSwitch-thumb": {
      color: "#33cf4d",
      border: "6px solid #fff",
    },
    "&.Mui-disabled .MuiSwitch-thumb": {
      color:
        theme.palette.mode === "light"
          ? theme.palette.grey[100]
          : theme.palette.grey[600],
    },
    "&.Mui-disabled + .MuiSwitch-track": {
      opacity: theme.palette.mode === "light" ? 0.7 : 0.3,
    },
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 14,
    height: 14,
    boxShadow: "none",
  },
  "& .MuiSwitch-track": {
    borderRadius: 26 / 2,
    backgroundColor: theme.palette.mode === "light" ? "#E9E9EA" : "#39393D",
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 500,
    }),
  },
}));

export default function EditProfile() {
  const { profile, getProfile } = useContext(PagesIndex.ProfileContext);

  const [initialValues, setInitialValues] = useState({
    image: null,
    name: "",
    email: "",
  });

  const [buttonSpinner, setButtonSpinner] = useState(false);

  useEffect(() => {
    if (profile) {
      setInitialValues({
        image: profile.image
          ? `${import.meta.env.VITE_IMAGE_URL}${profile.image}`
          : null,
        name: profile?.name || "",
        email: profile?.email || "",
      });
    }
  }, [profile]);

  const handleSubmit = async (values) => {
    const urlencoded = new FormData();
    urlencoded.append("profile", values?.image);
    urlencoded.append("name", values?.name);
    urlencoded.append("email", values?.email);

    setButtonSpinner(true);
    try {
      const res = await PagesIndex.apiPostHandler(
        PagesIndex.Api.EDIT_PROFILE,
        urlencoded
      );
      if (res.status) {
        getProfile();
        PagesIndex.toasterSuccess(res?.message);
      } else {
        PagesIndex.toasterError(res?.message);
      }
    } catch (error) {
      console.error(error);
    }
    setButtonSpinner(false);
  };

  // ✅ Helper function to get correct image src
  const getImageSrc = (image) => {
    if (image instanceof File && image.size > 0) {
      return URL.createObjectURL(image);
    }
    if (typeof image === "string" && image.trim() !== "") {
      return image;
    }
    return PagesIndex.Png.kp;
  };

  return (
    <Index.Box className="admin-edit-profile-main common-card">
      <Index.Typography
        className="admin-common-para admin-edit-highlight-text"
        component="p"
        variant="p"
      >
        General
      </Index.Typography>
      <Index.Typography
        className="admin-common-para admin-edit-para-text"
        component="p"
        variant="p"
      >
        Basic info, like your name and email that will be displayed in public
      </Index.Typography>

      <PagesIndex.Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={PagesIndex.editProfileSchema}
        onSubmit={handleSubmit}
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
            <Index.Box className="admin-edit-profile">
              <Index.Box className="admin-file-upload-btn-main">
                {/* ✅ Image Preview */}
                <img
                  src={getImageSrc(values?.image)}
                  className="admin-upload-profile-img"
                  alt="upload img"
                />

                <Index.Button
                  variant="contained"
                  component="label"
                  className="admin-file-upload-btn"
                >
                  <img
                    src={PagesIndex.Svg.edit}
                    className="admin-upload-icon-img"
                    alt="upload icon"
                  />
                  <input
                    hidden
                    accept="image/*"
                    multiple
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      setFieldValue("image", file);
                    }}
                  />
                </Index.Button>
              </Index.Box>

              {/* Validation Error for image */}
              <Index.FormHelperText error>
                {touched.image && errors.image ? errors.image : null}
              </Index.FormHelperText>
            </Index.Box>

            <Index.Box className="admin-add-user-data-main">
              <Index.Box className="edit-profile-row">
                <Index.Box className="grid-column">
                  <Index.Box className="admin-input-box admin-add-user-input">
                    <Index.FormHelperText className="admin-form-lable">
                      Name
                    </Index.FormHelperText>
                    <Index.Box className="admin-form-group">
                      <Index.TextField
                        fullWidth
                        className="admin-form-control"
                        id="name"
                        name="name"
                        value={values?.name}
                        placeholder="Enter Name"
                        onChange={handleChange}
                      />
                      <Index.FormHelperText error>
                        {touched.name && errors.name ? errors.name : null}
                      </Index.FormHelperText>
                    </Index.Box>
                  </Index.Box>
                </Index.Box>

                <Index.Box className="grid-column">
                  <Index.Box className="admin-input-box admin-add-user-input">
                    <Index.FormHelperText className="admin-form-lable">
                      Email
                    </Index.FormHelperText>
                    <Index.Box className="admin-form-group">
                      <Index.TextField
                        fullWidth
                        className="admin-form-control"
                        id="email"
                        name="email"
                        value={values?.email}
                        placeholder="Enter Email"
                        onChange={handleChange}
                      />
                      <Index.FormHelperText error>
                        {touched.email && errors.email ? errors.email : null}
                      </Index.FormHelperText>
                    </Index.Box>
                  </Index.Box>
                </Index.Box>
              </Index.Box>

              <Index.Box className="admin-user-btn-flex">
                <Index.Box className="admin-save-btn-main btn-main-primary">
                  <PagesIndex.PrimaryButton
                    type="submit"
                    className="admin-save-user-btn btn-primary"
                    btnLabel={
                      buttonSpinner ? (
                        <PagesIndex.Spinner />
                      ) : (
                        <>
                          <img
                            src={PagesIndex.Svg.save}
                            className="admin-user-save-icon"
                            alt="Save"
                          />
                          <span>Save</span>
                        </>
                      )
                    }
                  />
                </Index.Box>
              </Index.Box>
            </Index.Box>
          </PagesIndex.Form>
        )}
      </PagesIndex.Formik>
    </Index.Box>
  );
}
